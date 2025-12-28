Rails.application.routes.draw do
  namespace :api do
    # Health check
    get "health", to: "health#index"
    
    # Auth
    post "auth/register", to: "auth#register"
    post "auth/login", to: "auth#login"
    get "auth/me", to: "auth#me"
    
    # Users
    resources :users, only: [:show, :update]
    
    # Sessions
    resources :sessions do
      member do
        post :start
        post :complete
        post :extend_time
      end
      
      collection do
        post :join
      end
      
      resources :files, controller: "session_files"
      resources :participants, controller: "session_participants"
      resources :questions, controller: "session_questions"
      resources :chat_messages, only: [:index, :create]
      resources :executions, only: [:create]
    end
    
    # Questions
    resources :questions, only: [:index, :show, :create, :update, :destroy]
    
    # Executions
    resources :executions, only: [:index, :show]
  end
  
  # ActionCable WebSocket
  mount ActionCable.server => "/cable"
end
