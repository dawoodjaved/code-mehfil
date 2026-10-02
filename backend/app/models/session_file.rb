class SessionFile < ApplicationRecord
  belongs_to :session
  belongs_to :created_by, class_name: "User", foreign_key: "created_by_id", optional: true

  validates :filename, presence: true
  validates :path, presence: true
  validates :language, presence: true
  validates :path, uniqueness: { scope: :session_id }

  before_validation :set_defaults, on: :create
  before_create :generate_uuid
  after_update :broadcast_file_updated

  def update_content(new_content, user_id: nil)
    attrs = {
      content: new_content,
      updated_at: Time.current
    }
    attrs[:last_modified_by_id] = user_id if user_id.present? && self.class.column_names.include?("last_modified_by_id")
    update!(attrs)
  end

  private

  def generate_uuid
    self.id ||= SecureRandom.uuid
  end

  def set_defaults
    self.filename = filename.presence || File.basename(path.to_s.presence || "untitled")
    self.path = path.presence || "/#{filename}"
    self.content ||= ""
    self.language = language.presence || detect_language_from_filename
  end

  def detect_language_from_filename
    ext = File.extname(filename.to_s).downcase
    case ext
    when ".js" then "javascript"
    when ".ts" then "typescript"
    when ".py" then "python"
    when ".rb" then "ruby"
    when ".java" then "java"
    when ".cpp", ".cc", ".cxx" then "cpp"
    when ".c" then "c"
    when ".go" then "go"
    when ".rs" then "rust"
    when ".php" then "php"
    when ".swift" then "swift"
    else "plaintext"
    end
  end

  def broadcast_file_updated
    return unless defined?(ActionCable) && defined?(SessionsChannel)

    SessionsChannel.broadcast_to(
      session,
      type: "file_updated",
      file: as_json
    )
  rescue StandardError => e
    Rails.logger.warn("Failed to broadcast file updated: #{e.message}")
  end
end
