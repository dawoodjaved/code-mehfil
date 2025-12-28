class Question < ApplicationRecord
  # Associations
  belongs_to :created_by, class_name: "User", foreign_key: "created_by_id"
  has_many :test_cases, dependent: :destroy
  has_many :session_questions, dependent: :destroy
  has_many :sessions, through: :session_questions
  
  # Validations
  validates :title, presence: true
  validates :description, presence: true
  validates :difficulty, presence: true
  validates :category, presence: true
  
  # Enums
  enum difficulty: { easy: 0, medium: 1, hard: 2 }
  enum category: { 
    algorithms: 0, 
    data_structures: 1, 
    system_design: 2, 
    database: 3,
    frontend: 4,
    backend: 5,
    debugging: 6,
    other: 7
  }
  
  # Scopes
  scope :by_difficulty, ->(difficulty) { where(difficulty: difficulty) }
  scope :by_category, ->(category) { where(category: category) }
  scope :search, ->(query) { where("title ILIKE ? OR description ILIKE ?", "%#{query}%", "%#{query}%") }
  
  # Instance methods
  def starter_code_for_language(language)
    starter_code&.dig(language) || ""
  end
end
