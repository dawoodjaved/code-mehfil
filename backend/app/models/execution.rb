class Execution < ApplicationRecord
  # Language mapping: string to integer
  LANGUAGE_MAP = {
    'javascript' => 0,
    'typescript' => 1,
    'python' => 2,
    'java' => 3,
    'cpp' => 4,
    'c' => 5,
    'go' => 6,
    'rust' => 7,
    'php' => 8,
    'ruby' => 9,
    'swift' => 10
  }.freeze
  
  LANGUAGE_MAP_REVERSE = LANGUAGE_MAP.invert.freeze
  
  # Associations
  belongs_to :session
  belongs_to :user
  belongs_to :session_file, optional: true
  
  # Validations
  validates :language, presence: true
  validates :code, presence: true
  
  # Callbacks
  before_create :generate_uuid
  before_validation :normalize_language
  
  # Enums
  enum status: { pending: 0, running: 1, completed: 2, failed: 3, timeout: 4 }
  
  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :for_session, ->(session_id) { where(session_id: session_id) }
  
  # Instance methods
  def mark_completed(output:, execution_time_ms: nil, memory_kb: nil)
    update!(
      status: :completed,
      output: output,
      execution_time: execution_time_ms,
      memory_used: memory_kb,
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
  
  # Convert language integer to string
  def language_name
    LANGUAGE_MAP_REVERSE[language] || language.to_s
  end
  
  private
  
  def generate_uuid
    self.id ||= SecureRandom.uuid
  end
  
  def normalize_language
    # Convert string language to integer if needed
    if language.is_a?(String) || language.is_a?(Symbol)
      lang_str = language.to_s.downcase
      self.language = LANGUAGE_MAP[lang_str] if LANGUAGE_MAP.key?(lang_str)
    end
  end
end
