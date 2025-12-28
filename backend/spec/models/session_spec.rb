require 'rails_helper'

RSpec.describe Session, type: :model do
  describe 'validations' do
    it 'is valid with valid attributes' do
      session = build(:session)
      expect(session).to be_valid
    end
    
    it 'is invalid without a title' do
      session = build(:session, title: nil)
      expect(session).not_to be_valid
    end
    
    it 'is invalid without a session_type' do
      session = build(:session, session_type: nil)
      expect(session).not_to be_valid
    end
  end
  
  describe 'associations' do
    it 'belongs to created_by user' do
      assoc = Session.reflect_on_association(:created_by)
      expect(assoc.macro).to eq :belongs_to
    end
    
    it 'has many participants' do
      assoc = Session.reflect_on_association(:participants)
      expect(assoc.macro).to eq :has_many
    end
    
    it 'has many files' do
      assoc = Session.reflect_on_association(:files)
      expect(assoc.macro).to eq :has_many
    end
    
    it 'has many chat_messages' do
      assoc = Session.reflect_on_association(:chat_messages)
      expect(assoc.macro).to eq :has_many
    end
  end
  
  describe 'callbacks' do
    it 'generates a unique code before creation' do
      session = create(:session)
      expect(session.code).not_to be_nil
      expect(session.code.length).to eq 8
    end
    
    it 'adds creator as participant after creation' do
      user = create(:user)
      session = create(:session, created_by: user)
      
      participant = session.participants.find_by(user: user)
      expect(participant).to be_present
      expect(participant.role).to eq 'owner'
    end
  end
  
  describe '#add_participant' do
    it 'adds a user as participant' do
      session = create(:session)
      user = create(:user)
      
      participant = session.add_participant(user)
      
      expect(participant).to be_persisted
      expect(participant.user).to eq user
      expect(participant.session).to eq session
    end
    
    it 'does not create duplicate participants' do
      session = create(:session)
      user = create(:user)
      
      participant1 = session.add_participant(user)
      participant2 = session.add_participant(user)
      
      expect(participant1.id).to eq participant2.id
      expect(session.participants.where(user: user).count).to eq 1
    end
  end
  
  describe '#is_participant?' do
    it 'returns true if user is a participant' do
      session = create(:session)
      user = create(:user)
      session.add_participant(user)
      
      expect(session.is_participant?(user)).to be true
    end
    
    it 'returns false if user is not a participant' do
      session = create(:session)
      user = create(:user)
      
      expect(session.is_participant?(user)).to be false
    end
  end
  
  describe '#start!' do
    it 'sets status to active and records started_at' do
      session = create(:session, status: :draft)
      
      session.start!
      
      expect(session.status).to eq 'active'
      expect(session.started_at).to be_within(1.second).of(Time.current)
    end
  end
  
  describe '#complete!' do
    it 'sets status to completed and records ended_at' do
      session = create(:session, :active)
      
      session.complete!
      
      expect(session.status).to eq 'completed'
      expect(session.ended_at).to be_within(1.second).of(Time.current)
    end
  end
  
  describe '#duration_seconds' do
    it 'returns 0 when session has not started' do
      session = create(:session, started_at: nil)
      expect(session.duration_seconds).to eq 0
    end
    
    it 'calculates duration for completed session' do
      session = create(:session, started_at: 1.hour.ago, ended_at: Time.current)
      expect(session.duration_seconds).to be_within(5).of(3600)
    end
    
    it 'calculates duration for active session' do
      session = create(:session, started_at: 30.minutes.ago, ended_at: nil)
      expect(session.duration_seconds).to be_within(5).of(1800)
    end
  end
  
  describe '#extend_time!' do
    it 'extends time limit by specified minutes' do
      session = create(:session, time_limit_minutes: 60)
      
      session.extend_time!(15)
      
      expect(session.time_limit_minutes).to eq 75
    end
  end
end

