require 'rails_helper'

RSpec.describe 'Api::Executions', type: :request do
  let(:user) { create(:user) }
  let(:session) { create(:session, created_by: user) }
  let(:headers) { auth_header(user) }
  
  describe 'POST /api/sessions/:session_id/executions' do
    it 'creates a new execution' do
      params = {
        code: 'console.log("Hello");',
        language: 'javascript'
      }
      
      expect {
        post "/api/sessions/#{session.id}/executions", 
             params: params, 
             headers: headers, 
             as: :json
      }.to change(Execution, :count).by(1)
      
      expect(response).to have_http_status(:created)
      expect(json_response['code']).to eq('console.log("Hello");')
      expect(json_response['language']).to eq('javascript')
      expect(json_response['status']).to eq('pending')
    end
    
    it 'requires authentication' do
      params = {
        code: 'console.log("Hello");',
        language: 'javascript'
      }
      
      post "/api/sessions/#{session.id}/executions", params: params, as: :json
      
      expect(response).to have_http_status(:unauthorized)
    end
    
    it 'requires user to be session participant' do
      other_user = create(:user)
      other_session = create(:session, created_by: other_user)
      
      params = {
        code: 'console.log("Hello");',
        language: 'javascript'
      }
      
      post "/api/sessions/#{other_session.id}/executions",
           params: params,
           headers: headers,
           as: :json
      
      expect(response).to have_http_status(:forbidden)
    end
  end
  
  describe 'GET /api/executions' do
    it 'returns user executions' do
      create_list(:execution, 3, user: user, session: session)
      
      get '/api/executions', headers: headers
      
      expect(response).to have_http_status(:ok)
      expect(json_response.length).to eq(3)
    end
  end
  
  describe 'GET /api/executions/:id' do
    let(:execution) { create(:execution, :completed, user: user, session: session) }
    
    it 'returns execution details' do
      get "/api/executions/#{execution.id}", headers: headers
      
      expect(response).to have_http_status(:ok)
      expect(json_response['id']).to eq(execution.id)
      expect(json_response['output']).to be_present
    end
  end
end

