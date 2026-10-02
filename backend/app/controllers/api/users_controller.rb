module Api
  class UsersController < ApplicationController
    before_action :set_user, only: [:show, :update]
    
    def show
      if @user.id == current_user.id
        render json: {
          id: @user.id,
          name: @user.name,
          email: @user.email,
          created_at: @user.created_at,
          last_seen_at: @user.last_seen_at
        }
      else
        # Do not leak emails of other users
        render json: {
          id: @user.id,
          name: @user.name
        }
      end
    end
    
    def update
      unless @user.id == current_user.id
        render json: { error: "You can only update your own profile" }, status: :forbidden
        return
      end

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

    def set_user
      @user = User.find(params[:id])
    end
    
    def user_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation)
    end
  end
end
