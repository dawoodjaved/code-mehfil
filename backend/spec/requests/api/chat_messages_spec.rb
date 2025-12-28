require 'rails_helper'

RSpec.describe 'Api::ChatMessages', type: :request do
  let(:user) { create(:user) }
  let(:session) { create(:session, created_by: user) }
  let(:headers) { auth_header(user) }
  
  describe 'GET /api/sessions/:session_id/chat_messages' do
    it 'returns chat messages for session' do
      messages = create_list(:chat_message, 3, session: session, user: user)
      
      get "/api/sessions/#{session.id}/chat_messages", headers: headers
      
      expect(response).to have_http_status(:ok)
      expect(json_response.length).to eq(3)
    end
  end
  
  describe 'POST /api/sessions/:session_id/chat_messages' do
    it 'creates a new message' do
      params = {
        content: 'Hello everyone!',
        message_type: 'text'
      }
      
      expect {
        post "/api/sessions/#{session.id}/chat_messages",
             params: params,
             headers: headers,
             as: :json
      }.to change(ChatMessage, :count).by(1)
      
      expect(response).to have_http_status(:created)
      expect(json_response['content']).to eq('Hello everyone!')
      expect(json_response['user']['id']).to eq(user.id)
    end
    
    it 'validates content presence' do
      params = { content: '' }
      
      post "/api/sessions/#{session.id}/chat_messages",
           params: params,
           headers: headers,
           as: :json
      
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end

