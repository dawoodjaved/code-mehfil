class TestCase < ApplicationRecord
  belongs_to :question

  # Input may be empty (stdin-less problems); expected output is required.
  validates :expected_output, presence: true

  before_create :generate_uuid

  def matches?(actual_output)
    normalize_output(actual_output) == normalize_output(expected_output)
  end

  private

  def generate_uuid
    self.id ||= SecureRandom.uuid
  end

  def normalize_output(output)
    output.to_s.strip.gsub(/\s+/, " ")
  end
end
