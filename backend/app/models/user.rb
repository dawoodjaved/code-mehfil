class User < ApplicationRecord
  has_secure_password
  
  # Associations
  has_many :session_participants, dependent: :destroy
  has_many :sessions, through: :session_participants
  has_many :sessions_created, class_name: "Session", foreign_key: "created_by_id", dependent: :nullify
  has_many :chat_messages, dependent: :destroy
  has_many :questions_created, class_name: "Question", foreign_key: "created_by_id", dependent: :nullify
  has_many :executions, dependent: :destroy
  
  # Validations
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
  
  # Callbacks
  before_save :downcase_email
  
  # Instance methods
  def online?
    last_seen_at.present? && last_seen_at > 5.minutes.ago
  end
  
  def update_last_seen!
    update_column(:last_seen_at, Time.current)
  end
  
  private
  
  def downcase_email
    self.email = email.downcase if email.present?
  end
end
