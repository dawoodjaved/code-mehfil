class SessionParticipant < ApplicationRecord
  belongs_to :session
  belongs_to :user

  enum role: { participant: 0, owner: 1, interviewer: 2, candidate: 3 }

  validates :user_id, uniqueness: { scope: :session_id }
  validates :role, presence: true

  before_create :generate_uuid
  before_validation :set_default_role, on: :create
  after_create :broadcast_participant_joined
  after_destroy :broadcast_participant_left

  def online?
    last_seen_at.present? && last_seen_at > 5.minutes.ago
  end

  def update_last_seen!
    return unless self.class.column_names.include?("last_seen_at")

    update_column(:last_seen_at, Time.current)
  end

  def cursor_position=(position)
    value = position.is_a?(String) ? position : position
    update_column(:cursor_position, value)
  end

  private

  def generate_uuid
    self.id ||= SecureRandom.uuid
  end

  def set_default_role
    self.role ||= :participant
  end

  def broadcast_participant_joined
    return unless defined?(ActionCable) && defined?(SessionsChannel)

    SessionsChannel.broadcast_to(
      session,
      type: "participant_joined",
      participant: as_json(include: { user: { only: [:id, :name, :email] } })
    )
  rescue StandardError => e
    Rails.logger.warn("Failed to broadcast participant joined: #{e.message}")
  end

  def broadcast_participant_left
    return unless defined?(ActionCable) && defined?(SessionsChannel)

    SessionsChannel.broadcast_to(
      session,
      type: "participant_left",
      participant_id: id
    )
  rescue StandardError => e
    Rails.logger.warn("Failed to broadcast participant left: #{e.message}")
  end
end
