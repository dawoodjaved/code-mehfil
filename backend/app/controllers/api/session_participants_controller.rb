module Api
  class SessionParticipantsController < ApplicationController
    before_action :set_session
    
    def index
      participants = @session.participants.includes(:user)
      render json: participants.as_json(
        include: { user: { only: [:id, :name, :email] } }
      )
    end
    
    def create
      user = User.find_by(email: params[:email])
      
      unless user
        render json: { error: 'User not found' }, status: :not_found
        return
      end
      
      participant = @session.add_participant(user, role: params[:role] || 'participant')
      
      render json: participant.as_json(
        include: { user: { only: [:id, :name, :email] } }
      ), status: :created
    end
    
    def update
      participant = @session.participants.find(params[:id])
      
      if participant.update(role: params[:role])
        render json: participant.as_json(
          include: { user: { only: [:id, :name, :email] } }
        )
      else
        render json: { errors: participant.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    def destroy
      participant = @session.participants.find(params[:id])
      participant.destroy
      head :no_content
    end
    
    private
    
    def set_session
      @session = Session.find(params[:session_id])
      
      unless @session.is_participant?(current_user)
        render json: { error: 'Access denied' }, status: :forbidden
      end
    end
  end
end
