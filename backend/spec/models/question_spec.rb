require 'rails_helper'

RSpec.describe Question, type: :model do
  describe 'validations' do
    it 'is valid with valid attributes' do
      question = build(:question)
      expect(question).to be_valid
    end
    
    it 'is invalid without a title' do
      question = build(:question, title: nil)
      expect(question).not_to be_valid
    end
    
    it 'is invalid without a description' do
      question = build(:question, description: nil)
      expect(question).not_to be_valid
    end
    
    it 'is invalid without a difficulty' do
      question = build(:question, difficulty: nil)
      expect(question).not_to be_valid
    end
    
    it 'is invalid without a category' do
      question = build(:question, category: nil)
      expect(question).not_to be_valid
    end
  end
  
  describe 'associations' do
    it 'belongs to created_by user' do
      assoc = Question.reflect_on_association(:created_by)
      expect(assoc.macro).to eq :belongs_to
    end
    
    it 'has many test_cases' do
      assoc = Question.reflect_on_association(:test_cases)
      expect(assoc.macro).to eq :has_many
    end
  end
  
  describe 'scopes' do
    before do
      @easy_algo = create(:question, difficulty: :easy, category: :algorithms, title: 'Easy Algo')
      @medium_algo = create(:question, difficulty: :medium, category: :algorithms, title: 'Medium Algo')
      @hard_ds = create(:question, difficulty: :hard, category: :data_structures, title: 'Hard DS')
    end
    
    it 'filters by difficulty' do
      results = Question.by_difficulty(:easy)
      expect(results).to include(@easy_algo)
      expect(results).not_to include(@medium_algo, @hard_ds)
    end
    
    it 'filters by category' do
      results = Question.by_category(:algorithms)
      expect(results).to include(@easy_algo, @medium_algo)
      expect(results).not_to include(@hard_ds)
    end
    
    it 'searches by title and description' do
      results = Question.search('Algo')
      expect(results).to include(@easy_algo, @medium_algo)
      expect(results).not_to include(@hard_ds)
    end
  end
  
  describe '#starter_code_for_language' do
    it 'returns starter code for specified language' do
      question = create(:question, starter_code: { 'javascript' => 'function test() {}' })
      expect(question.starter_code_for_language('javascript')).to eq 'function test() {}'
    end
    
    it 'returns empty string for unsupported language' do
      question = create(:question, starter_code: { 'javascript' => 'function test() {}' })
      expect(question.starter_code_for_language('rust')).to eq ''
    end
  end
end

