class Execution < ApplicationRecord
  # Associations
  belongs_to :session
  belongs_to :user
  belongs_to :session_file, optional: true
  
  # Validations
  validates :language, presence: true
  validates :code, presence: true
  
  # Enums
  enum status: { pending: 0, running: 1, completed: 2, failed: 3, timeout: 4 }
  
  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :for_session, ->(session_id) { where(session_id: session_id) }
  
  # Instance methods
  def mark_completed(output:, execution_time_ms:, memory_kb: nil)
    update!(
      status: :completed,
      output: output,
      execution_time_ms: execution_time_ms,
      memory_kb: memory_kb,
      completed_at: Time.current
    )
  end
  
  def mark_failed(error:)
    update!(
      status: :failed,
      error: error,
      completed_at: Time.current
    )
  end
  
  def mark_timeout
    update!(
      status: :timeout,
      error: "Execution timed out",
      completed_at: Time.current
    )
  end
end
