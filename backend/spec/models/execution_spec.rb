require 'rails_helper'

RSpec.describe Execution, type: :model do
  describe 'validations' do
    it 'is valid with valid attributes' do
      execution = build(:execution)
      expect(execution).to be_valid
    end
    
    it 'is invalid without language' do
      execution = build(:execution, language: nil)
      expect(execution).not_to be_valid
    end
    
    it 'is invalid without code' do
      execution = build(:execution, code: nil)
      expect(execution).not_to be_valid
    end
  end
  
  describe 'associations' do
    it 'belongs to session' do
      assoc = Execution.reflect_on_association(:session)
      expect(assoc.macro).to eq :belongs_to
    end
    
    it 'belongs to user' do
      assoc = Execution.reflect_on_association(:user)
      expect(assoc.macro).to eq :belongs_to
    end
  end
  
  describe '#mark_completed' do
    it 'updates status and execution details' do
      execution = create(:execution)
      
      execution.mark_completed(
        output: 'Hello World',
        execution_time_ms: 45,
        memory_kb: 2048
      )
      
      expect(execution.status).to eq 'completed'
      expect(execution.output).to eq 'Hello World'
      expect(execution.execution_time_ms).to eq 45
      expect(execution.memory_kb).to eq 2048
      expect(execution.completed_at).to be_within(1.second).of(Time.current)
    end
  end
  
  describe '#mark_failed' do
    it 'updates status with error message' do
      execution = create(:execution)
      
      execution.mark_failed(error: 'Syntax Error')
      
      expect(execution.status).to eq 'failed'
      expect(execution.error).to eq 'Syntax Error'
      expect(execution.completed_at).to be_within(1.second).of(Time.current)
    end
  end
  
  describe '#mark_timeout' do
    it 'updates status to timeout' do
      execution = create(:execution)
      
      execution.mark_timeout
      
      expect(execution.status).to eq 'timeout'
      expect(execution.error).to eq 'Execution timed out'
    end
  end
end

