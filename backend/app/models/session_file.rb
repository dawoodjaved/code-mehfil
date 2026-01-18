class SessionFile < ApplicationRecord
  # Associations
  belongs_to :session
  belongs_to :created_by, class_name: "User", foreign_key: "created_by_id", optional: true
  
  # Validations
  validates :filename, presence: true
  validates :language, presence: true
  
  # Callbacks
  before_create :set_defaults
  after_update :broadcast_file_updated
  
  # Instance methods
  def update_content(new_content, user_id: nil)
    update!(
      content: new_content,
      last_modified_by_id: user_id,
      updated_at: Time.current
    )
  end
  
  private
  
  def set_defaults
    self.content ||= ""
    self.language ||= detect_language_from_filename
  end
  
  def detect_language_from_filename
    ext = File.extname(filename).downcase
    case ext
    when '.js' then 'javascript'
    when '.ts' then 'typescript'
    when '.py' then 'python'
    when '.rb' then 'ruby'
    when '.java' then 'java'
    when '.cpp', '.cc', '.cxx' then 'cpp'
    when '.c' then 'c'
    when '.go' then 'go'
    when '.rs' then 'rust'
    when '.php' then 'php'
    when '.swift' then 'swift'
    else 'plaintext'
    end
  end
  
  def broadcast_file_updated
    return unless defined?(ActionCable)
    begin
      channel_class = begin
        SessionsChannel
      rescue NameError
        nil
      end
      
      if channel_class
        channel_class.broadcast_to(
          session,
          type: 'file_updated',
          file: as_json
        )
      end
    rescue => e
      Rails.logger.warn "Failed to broadcast file updated: #{e.message}"
    end
  end
end
