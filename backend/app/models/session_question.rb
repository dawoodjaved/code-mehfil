class SessionQuestion < ApplicationRecord
  # Associations
  belongs_to :session
  belongs_to :question
  
  # Validations
  validates :question_id, uniqueness: { scope: :session_id }
  
  # Enums
  enum status: { pending: 0, in_progress: 1, completed: 2, skipped: 3 }
  
  # Instance methods
  def mark_completed(time_taken_seconds = nil)
    update!(
      status: :completed,
      completed_at: Time.current,
      time_taken_seconds: time_taken_seconds
    )
  end
  
  def mark_in_progress
    update!(status: :in_progress, started_at: Time.current)
  end
end
