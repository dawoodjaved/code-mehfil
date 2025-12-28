module Api
  class AuthController < ApplicationController
    skip_before_action :authenticate_request, only: [:register, :login]
    
    def register
      user = User.new(user_params)
      
      if user.save
        token = JsonWebToken.encode(user_id: user.id)
        render json: {
          user: user_response(user),
          token: token
        }, status: :created
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    def login
      user = User.find_by(email: params[:email]&.downcase)
      
      if user&.authenticate(params[:password])
        token = JsonWebToken.encode(user_id: user.id)
        user.update_last_seen!
        
        render json: {
          user: user_response(user),
          token: token
        }
      else
        render json: { error: 'Invalid email or password' }, status: :unauthorized
      end
    end
    
    def me
      render json: { user: user_response(current_user) }
    end
    
    private
    
    def user_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation)
    end
    
    def user_response(user)
      {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        last_seen_at: user.last_seen_at
      }
    end
  end
end
