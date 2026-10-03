class Question < ApplicationRecord
  belongs_to :created_by, class_name: "User", foreign_key: "created_by_id"
  has_many :test_cases, dependent: :destroy
  has_many :session_questions, dependent: :destroy
  has_many :sessions, through: :session_questions

  SOURCES = %w[internal hackerrank codeforces custom].freeze

  validates :title, presence: true
  validates :description, presence: true
  validates :difficulty, presence: true
  validates :category, presence: true
  validates :source, inclusion: { in: SOURCES }
  validates :external_id, uniqueness: { scope: :source }, allow_nil: true

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

  before_create :generate_uuid
  before_validation :normalize_source

  scope :by_difficulty, ->(difficulty) { where(difficulty: difficulty) }
  scope :by_category, ->(category) { where(category: category) }
  scope :by_source, ->(source) { where(source: source) }
  scope :search, lambda { |query|
    q = "%#{query.to_s.strip}%"
    where("title ILIKE ? OR description ILIKE ?", q, q)
  }
  scope :with_starter_language, lambda { |language|
    where("starter_code ? :lang", lang: language.to_s)
  }
  scope :internal, -> { where(source: "internal") }
  scope :hackerrank, -> { where(source: "hackerrank") }

  def starter_code_for_language(language)
    code = starter_code
    return "" if code.blank?

    if code.is_a?(Hash)
      code[language].to_s
    else
      code.to_s
    end
  end

  def link_out?
    external_url.present?
  end

  private

  def generate_uuid
    self.id ||= SecureRandom.uuid
  end

  def normalize_source
    self.source = (source.presence || "internal").to_s.downcase
  end
end
