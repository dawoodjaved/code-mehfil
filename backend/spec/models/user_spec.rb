require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    it 'is valid with valid attributes' do
      user = build(:user)
      expect(user).to be_valid
    end
    
    it 'is invalid without an email' do
      user = build(:user, email: nil)
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("can't be blank")
    end
    
    it 'is invalid with a duplicate email' do
      create(:user, email: 'test@example.com')
      user = build(:user, email: 'test@example.com')
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include('has already been taken')
    end
    
    it 'is invalid with an invalid email format' do
      user = build(:user, email: 'invalid_email')
      expect(user).not_to be_valid
    end
    
    it 'is invalid without a name' do
      user = build(:user, name: nil)
      expect(user).not_to be_valid
    end
    
    it 'is invalid with a short password' do
      user = build(:user, password: '123', password_confirmation: '123')
      expect(user).not_to be_valid
      expect(user.errors[:password]).to include('is too short (minimum is 6 characters)')
    end
  end
  
  describe 'associations' do
    it 'has many session_participants' do
      assoc = User.reflect_on_association(:session_participants)
      expect(assoc.macro).to eq :has_many
    end
    
    it 'has many sessions through session_participants' do
      assoc = User.reflect_on_association(:sessions)
      expect(assoc.macro).to eq :has_many
      expect(assoc.options[:through]).to eq :session_participants
    end
    
    it 'has many sessions_created' do
      assoc = User.reflect_on_association(:sessions_created)
      expect(assoc.macro).to eq :has_many
    end
    
    it 'has many chat_messages' do
      assoc = User.reflect_on_association(:chat_messages)
      expect(assoc.macro).to eq :has_many
    end
  end
  
  describe '#online?' do
    it 'returns true when last_seen_at is within 5 minutes' do
      user = create(:user, last_seen_at: 2.minutes.ago)
      expect(user.online?).to be true
    end
    
    it 'returns false when last_seen_at is older than 5 minutes' do
      user = create(:user, last_seen_at: 10.minutes.ago)
      expect(user.online?).to be false
    end
    
    it 'returns false when last_seen_at is nil' do
      user = create(:user, last_seen_at: nil)
      expect(user.online?).to be false
    end
  end
  
  describe '#update_last_seen!' do
    it 'updates last_seen_at to current time' do
      user = create(:user, last_seen_at: 1.hour.ago)
      old_time = user.last_seen_at
      
      user.update_last_seen!
      
      expect(user.last_seen_at).to be > old_time
      expect(user.last_seen_at).to be_within(1.second).of(Time.current)
    end
  end
  
  describe 'callbacks' do
    it 'downcases email before saving' do
      user = create(:user, email: 'TEST@EXAMPLE.COM')
      expect(user.email).to eq 'test@example.com'
    end
  end
end

