require 'rails_helper'

RSpec.describe 'Api::Auth', type: :request do
  describe 'POST /api/auth/register' do
    context 'with valid parameters' do
      it 'creates a new user and returns token' do
        params = {
          user: {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            password_confirmation: 'password123'
          }
        }
        
        post '/api/auth/register', params: params, as: :json
        
        expect(response).to have_http_status(:created)
        expect(json_response['user']).to be_present
        expect(json_response['user']['email']).to eq('test@example.com')
        expect(json_response['token']).to be_present
      end
    end
    
    context 'with invalid parameters' do
      it 'returns errors for invalid email' do
        params = {
          user: {
            name: 'Test User',
            email: 'invalid_email',
            password: 'password123',
            password_confirmation: 'password123'
          }
        }
        
        post '/api/auth/register', params: params, as: :json
        
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['errors']).to be_present
      end
      
      it 'returns errors for duplicate email' do
        create(:user, email: 'test@example.com')
        
        params = {
          user: {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            password_confirmation: 'password123'
          }
        }
        
        post '/api/auth/register', params: params, as: :json
        
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['errors']).to include(match(/email/i))
      end
    end
  end
  
  describe 'POST /api/auth/login' do
    let!(:user) { create(:user, email: 'test@example.com', password: 'password123') }
    
    context 'with valid credentials' do
      it 'returns user and token' do
        params = {
          email: 'test@example.com',
          password: 'password123'
        }
        
        post '/api/auth/login', params: params, as: :json
        
        expect(response).to have_http_status(:ok)
        expect(json_response['user']['email']).to eq('test@example.com')
        expect(json_response['token']).to be_present
      end
    end
    
    context 'with invalid credentials' do
      it 'returns error for wrong password' do
        params = {
          email: 'test@example.com',
          password: 'wrong_password'
        }
        
        post '/api/auth/login', params: params, as: :json
        
        expect(response).to have_http_status(:unauthorized)
        expect(json_response['error']).to eq('Invalid email or password')
      end
      
      it 'returns error for non-existent user' do
        params = {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
        
        post '/api/auth/login', params: params, as: :json
        
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
  
  describe 'GET /api/auth/me' do
    let(:user) { create(:user) }
    
    context 'with valid token' do
      it 'returns current user' do
        get '/api/auth/me', headers: auth_header(user)
        
        expect(response).to have_http_status(:ok)
        expect(json_response['user']['id']).to eq(user.id)
        expect(json_response['user']['email']).to eq(user.email)
      end
    end
    
    context 'without token' do
      it 'returns unauthorized' do
        get '/api/auth/me'
        
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end

