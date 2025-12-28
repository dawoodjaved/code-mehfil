class SessionParticipant < ApplicationRecord
  # Associations
  belongs_to :session
  belongs_to :user
  
  # Enums
  enum role: { participant: 0, owner: 1, interviewer: 2, candidate: 3 }
  
  # Validations
  validates :user_id, uniqueness: { scope: :session_id }
  validates :role, presence: true
  
  # Callbacks
  after_create :broadcast_participant_joined
  after_destroy :broadcast_participant_left
  
  # Instance methods
  def online?
    last_seen_at.present? && last_seen_at > 5.minutes.ago
  end
  
  def update_last_seen!
    update_column(:last_seen_at, Time.current)
  end
  
  def cursor_position=(position)
    update_column(:cursor_position, position.to_json)
  end
  
  private
  
  def broadcast_participant_joined
    SessionsChannel.broadcast_to(
      session,
      type: 'participant_joined',
      participant: as_json(include: { user: { only: [:id, :name, :email] } })
    )
  end
  
  def broadcast_participant_left
    SessionsChannel.broadcast_to(
      session,
      type: 'participant_left',
      participant_id: id
    )
  end
end
