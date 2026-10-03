class Session < ApplicationRecord
  # Associations
  belongs_to :created_by, class_name: "User", foreign_key: "created_by_id"
  has_many :participants, class_name: "SessionParticipant", dependent: :destroy
  has_many :users, through: :participants
  has_many :files, class_name: "SessionFile", dependent: :destroy
  has_many :executions, dependent: :destroy
  has_many :session_questions, dependent: :destroy
  has_many :questions, through: :session_questions
  has_many :chat_messages, dependent: :destroy
  
  # Enums
  enum session_type: { collaboration: 0, interview: 1, practice: 2 }
  enum status: { draft: 0, active: 1, paused: 2, completed: 3, archived: 4 }
  
  # Validations
  validates :title, presence: true
  validates :session_type, presence: true
  validates :status, presence: true
  
  # Callbacks
  before_create :generate_uuid
  before_create :generate_unique_code
  before_create :set_default_status
  before_validation :set_default_title, on: :create
  after_create :add_creator_as_participant
  
  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :active_sessions, -> { where(status: :active) }
  
  # Instance methods
  def add_participant(user, role: 'participant')
    participants.find_or_create_by(user: user) do |participant|
      participant.role = role
    end
  end
  
  def is_participant?(user)
    return false unless user

    participants.exists?(user_id: user.id) || created_by_id == user.id
  end
  
  def start!
    update!(status: :active, started_at: Time.current)
  end
  
  def complete!
    update!(status: :completed, ended_at: Time.current)
  end
  
  def duration_seconds
    return 0 unless started_at
    end_time = ended_at || Time.current
    (end_time - started_at).to_i
  end
  
  def extend_time!(minutes)
    if time_limit_minutes
      update!(time_limit_minutes: time_limit_minutes + minutes)
    end
  end
  
  private

  def generate_uuid
    self.id ||= SecureRandom.uuid
  end

  def set_default_status
    self.status ||= :draft
  end

  def set_default_title
    if title.blank?
      session_type_name = session_type.to_s.humanize
      timestamp = Time.current.strftime("%B %d, %Y")
      self.title = "#{session_type_name} Session - #{timestamp}"
    end
  end

  def generate_unique_code
    self.code = loop do
      random_code = SecureRandom.alphanumeric(8).upcase
      break random_code unless Session.exists?(code: random_code)
    end
  end

  def add_creator_as_participant
    add_participant(created_by, role: 'owner')
  end
end
