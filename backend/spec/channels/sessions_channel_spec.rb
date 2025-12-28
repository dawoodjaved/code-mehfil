require 'rails_helper'

RSpec.describe SessionsChannel, type: :channel do
  let(:user) { create(:user) }
  let(:session) { create(:session, created_by: user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  
  before do
    stub_connection current_user: user
  end
  
  describe '#subscribed' do
    context 'when user is session participant' do
      it 'successfully subscribes to the session' do
        subscribe(session_id: session.id)
        
        expect(subscription).to be_confirmed
        expect(subscription).to have_stream_for(session)
      end
      
      it 'broadcasts user joined message' do
        expect {
          subscribe(session_id: session.id)
        }.to have_broadcasted_to(session).with(
          hash_including(type: 'user_joined')
        )
      end
    end
    
    context 'when user is not session participant' do
      let(:other_session) { create(:session) }
      
      it 'rejects subscription' do
        subscribe(session_id: other_session.id)
        
        expect(subscription).to be_rejected
      end
    end
  end
  
  describe '#unsubscribed' do
    it 'broadcasts user left message' do
      subscribe(session_id: session.id)
      
      expect {
        unsubscribe
      }.to have_broadcasted_to(session).with(
        hash_including(type: 'user_left')
      )
    end
  end
  
  describe '#code_change' do
    it 'broadcasts code changes to session' do
      subscribe(session_id: session.id)
      
      expect {
        perform :code_change, {
          file_id: 1,
          content: 'console.log("test");',
          cursor_position: { line: 1, column: 10 }
        }
      }.to have_broadcasted_to(session).with(
        hash_including(
          type: 'code_change',
          file_id: 1,
          user_id: user.id
        )
      )
    end
  end
  
  describe '#cursor_update' do
    it 'broadcasts cursor position updates' do
      subscribe(session_id: session.id)
      
      expect {
        perform :cursor_update, {
          file_id: 1,
          position: { line: 5, column: 10 }
        }
      }.to have_broadcasted_to(session).with(
        hash_including(
          type: 'cursor_update',
          user_id: user.id,
          position: { line: 5, column: 10 }
        )
      )
    end
  end
  
  describe '#typing' do
    it 'broadcasts typing indicators' do
      subscribe(session_id: session.id)
      
      expect {
        perform :typing, { is_typing: true }
      }.to have_broadcasted_to(session).with(
        hash_including(
          type: 'typing',
          user_id: user.id,
          is_typing: true
        )
      )
    end
  end
end

