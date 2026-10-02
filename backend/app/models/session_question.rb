class SessionQuestion < ApplicationRecord
  belongs_to :session
  belongs_to :question

  validates :question_id, uniqueness: { scope: :session_id }

  before_create :generate_uuid

  # Schema only has assigned_at / completed_at — keep helpers without a status column.
  def mark_completed(_time_taken_seconds = nil)
    update!(completed_at: Time.current)
  end

  def mark_in_progress
    # No started_at column in schema; keep method for API compatibility.
    touch if persisted?
  end

  def completed?
    completed_at.present?
  end

  private

  def generate_uuid
    self.id ||= SecureRandom.uuid
  end
end
