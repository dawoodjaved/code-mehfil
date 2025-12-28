class TestCase < ApplicationRecord
  # Associations
  belongs_to :question
  
  # Validations
  validates :input, presence: true
  validates :expected_output, presence: true
  
  # Instance methods
  def matches?(actual_output)
    normalize_output(actual_output) == normalize_output(expected_output)
  end
  
  private
  
  def normalize_output(output)
    output.to_s.strip.gsub(/\s+/, ' ')
  end
end
