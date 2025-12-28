require 'rails_helper'

RSpec.describe 'Api::Sessions', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_header(user) }
  
  describe 'GET /api/sessions' do
    it 'returns user sessions' do
      sessions = create_list(:session, 3, created_by: user)
      
      get '/api/sessions', headers: headers
      
      expect(response).to have_http_status(:ok)
      expect(json_response.length).to eq(4) # 3 created + 1 as participant (creator auto-added)
    end
    
    it 'requires authentication' do
      get '/api/sessions'
      
      expect(response).to have_http_status(:unauthorized)
    end
  end
  
  describe 'GET /api/sessions/:id' do
    let(:session) { create(:session, created_by: user) }
    
    it 'returns session details' do
      get "/api/sessions/#{session.id}", headers: headers
      
      expect(response).to have_http_status(:ok)
      expect(json_response['id']).to eq(session.id)
      expect(json_response['title']).to eq(session.title)
    end
    
    it 'returns forbidden for non-participant' do
      other_user = create(:user)
      other_session = create(:session, created_by: other_user)
      
      get "/api/sessions/#{other_session.id}", headers: headers
      
      expect(response).to have_http_status(:forbidden)
    end
  end
  
  describe 'POST /api/sessions' do
    context 'with valid parameters' do
      it 'creates a new session' do
        params = {
          session: {
            title: 'Test Session',
            description: 'Test description',
            session_type: 'practice',
            language: 'javascript'
          }
        }
        
        expect {
          post '/api/sessions', params: params, headers: headers, as: :json
        }.to change(Session, :count).by(1)
        
        expect(response).to have_http_status(:created)
        expect(json_response['title']).to eq('Test Session')
        expect(json_response['code']).to be_present
      end
    end
    
    context 'with invalid parameters' do
      it 'returns errors' do
        params = {
          session: {
            title: '',
            session_type: 'practice'
          }
        }
        
        post '/api/sessions', params: params, headers: headers, as: :json
        
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['errors']).to be_present
      end
    end
  end
  
  describe 'POST /api/sessions/join' do
    let(:session) { create(:session) }
    
    it 'joins session by code' do
      params = { code: session.code }
      
      post '/api/sessions/join', params: params, headers: headers, as: :json
      
      expect(response).to have_http_status(:ok)
      expect(json_response['session']['id']).to eq(session.id)
      expect(session.participants.exists?(user: user)).to be true
    end
    
    it 'returns error for invalid code' do
      params = { code: 'INVALID' }
      
      post '/api/sessions/join', params: params, headers: headers, as: :json
      
      expect(response).to have_http_status(:not_found)
    end
  end
  
  describe 'POST /api/sessions/:id/start' do
    let(:session) { create(:session, created_by: user) }
    
    it 'starts the session' do
      post "/api/sessions/#{session.id}/start", headers: headers
      
      expect(response).to have_http_status(:ok)
      session.reload
      expect(session.status).to eq('active')
      expect(session.started_at).to be_present
    end
  end
  
  describe 'POST /api/sessions/:id/complete' do
    let(:session) { create(:session, :active, created_by: user) }
    
    it 'completes the session' do
      post "/api/sessions/#{session.id}/complete", headers: headers
      
      expect(response).to have_http_status(:ok)
      session.reload
      expect(session.status).to eq('completed')
      expect(session.ended_at).to be_present
    end
  end
  
  describe 'POST /api/sessions/:id/extend_time' do
    let(:session) { create(:session, created_by: user, time_limit_minutes: 60) }
    
    it 'extends session time' do
      params = { minutes: 15 }
      
      post "/api/sessions/#{session.id}/extend_time", params: params, headers: headers
      
      expect(response).to have_http_status(:ok)
      session.reload
      expect(session.time_limit_minutes).to eq(75)
    end
  end
end

