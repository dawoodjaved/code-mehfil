require 'rails_helper'

RSpec.describe 'Api::Questions', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_header(user) }
  
  describe 'GET /api/questions' do
    before do
      create(:question, difficulty: :easy, category: :algorithms, title: 'Easy Algo')
      create(:question, difficulty: :medium, category: :data_structures, title: 'Medium DS')
      create(:question, difficulty: :hard, category: :algorithms, title: 'Hard Algo')
    end
    
    it 'returns all questions' do
      get '/api/questions', headers: headers
      
      expect(response).to have_http_status(:ok)
      expect(json_response.length).to eq(3)
    end
    
    it 'filters by difficulty' do
      get '/api/questions', params: { difficulty: 'easy' }, headers: headers
      
      expect(response).to have_http_status(:ok)
      expect(json_response.length).to eq(1)
      expect(json_response.first['title']).to eq('Easy Algo')
    end
    
    it 'filters by category' do
      get '/api/questions', params: { category: 'algorithms' }, headers: headers
      
      expect(response).to have_http_status(:ok)
      expect(json_response.length).to eq(2)
    end
    
    it 'searches by query' do
      get '/api/questions', params: { q: 'Algo' }, headers: headers
      
      expect(response).to have_http_status(:ok)
      expect(json_response.length).to eq(2)
    end
  end
  
  describe 'POST /api/questions' do
    it 'creates a new question' do
      params = {
        question: {
          title: 'New Question',
          description: 'Description here',
          difficulty: 'easy',
          category: 'algorithms',
          time_limit_minutes: 20
        }
      }
      
      expect {
        post '/api/questions', params: params, headers: headers, as: :json
      }.to change(Question, :count).by(1)
      
      expect(response).to have_http_status(:created)
      expect(json_response['title']).to eq('New Question')
    end
  end
end

