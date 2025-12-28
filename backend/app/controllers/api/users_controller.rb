module Api
  class UsersController < ApplicationController
    def show
      user = User.find(params[:id])
      render json: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        last_seen_at: user.last_seen_at
      }
    end
    
    def update
      if current_user.update(user_params)
        render json: {
          id: current_user.id,
          name: current_user.name,
          email: current_user.email
        }
      else
        render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    private
    
    def user_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation)
    end
  end
end
