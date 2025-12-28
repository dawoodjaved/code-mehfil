class ChatMessage < ApplicationRecord
  # Associations
  belongs_to :session
  belongs_to :user
  
  # Validations
  validates :content, presence: true, length: { maximum: 5000 }
  validates :message_type, presence: true
  
  # Enums
  enum message_type: { text: 0, system: 1, code: 2, file: 3 }
  
  # Callbacks
  after_create :broadcast_message
  
  # Scopes
  scope :recent, -> { order(created_at: :desc).limit(100) }
  scope :chronological, -> { order(created_at: :asc) }
  
  private
  
  def broadcast_message
    SessionsChannel.broadcast_to(
      session,
      type: 'chat_message',
      message: as_json(include: { user: { only: [:id, :name, :email] } })
    )
  end
end
