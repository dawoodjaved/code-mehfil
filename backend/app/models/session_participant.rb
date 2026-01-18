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
  before_create :generate_uuid
  before_validation :set_default_role, on: :create
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

  def generate_uuid
    self.id ||= SecureRandom.uuid
  end

  def set_default_role
    self.role ||= :participant
  end

  def broadcast_participant_joined
    # Skip broadcasting if ActionCable is not available
    return unless defined?(ActionCable)
    begin
      # Check if SessionsChannel class exists by trying to reference it
      channel_class = begin
        SessionsChannel
      rescue NameError
        nil
      end
      
      if channel_class
        channel_class.broadcast_to(
          session,
          type: 'participant_joined',
          participant: as_json(include: { user: { only: [:id, :name, :email] } })
        )
      end
    rescue => e
      Rails.logger.warn "Failed to broadcast participant joined: #{e.message}"
    end
  end

  def broadcast_participant_left
    # Skip broadcasting if ActionCable is not available
    return unless defined?(ActionCable)
    begin
      # Check if SessionsChannel class exists by trying to reference it
      channel_class = begin
        SessionsChannel
      rescue NameError
        nil
      end
      
      if channel_class
        channel_class.broadcast_to(
          session,
          type: 'participant_left',
          participant_id: id
        )
      end
    rescue => e
      Rails.logger.warn "Failed to broadcast participant left: #{e.message}"
    end
  end
end
