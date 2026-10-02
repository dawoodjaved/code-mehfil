class ChatMessage < ApplicationRecord
  belongs_to :session
  belongs_to :user

  validates :content, presence: true, length: { maximum: 5000 }
  validates :message_type, presence: true

  enum message_type: { text: 0, system: 1, code: 2, file: 3 }

  before_create :generate_uuid
  after_create :broadcast_message

  scope :recent, -> { order(created_at: :desc).limit(100) }
  scope :chronological, -> { order(created_at: :asc) }

  private

  def generate_uuid
    self.id ||= SecureRandom.uuid
  end

  def broadcast_message
    return unless defined?(ActionCable) && defined?(SessionsChannel)

    SessionsChannel.broadcast_to(
      session,
      type: "chat_message",
      message: as_json(include: { user: { only: [:id, :name, :email] } })
    )
  rescue StandardError => e
    Rails.logger.warn("Failed to broadcast chat message: #{e.message}")
  end
end
