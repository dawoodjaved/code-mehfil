module Api
  class SessionsController < ApplicationController
    before_action :set_session, only: [:show, :update, :destroy, :start, :complete, :extend_time]
    
    def index
      sessions = current_user.sessions.includes(:created_by, :participants).recent
      render json: sessions.as_json(
        include: {
          created_by: { only: [:id, :name, :email] },
          participants: {
            include: { user: { only: [:id, :name, :email] } }
          }
        }
      )
    end
    
    def show
      render json: @session.as_json(
        include: {
          created_by: { only: [:id, :name, :email] },
          participants: {
            include: { user: { only: [:id, :name, :email] } }
          },
          files: { only: [:id, :filename, :language, :created_at] },
          questions: { only: [:id, :title, :difficulty, :category] }
        }
      )
    end
    
    def create
      session = current_user.sessions_created.build(session_params)
      
      if session.save
        render json: session, status: :created
      else
        render json: { errors: session.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    def update
      if @session.update(session_params)
        render json: @session
      else
        render json: { errors: @session.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    def destroy
      @session.destroy
      head :no_content
    end
    
    def start
      if @session.start!
        render json: @session
      else
        render json: { errors: @session.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    def complete
      if @session.complete!
        render json: @session
      else
        render json: { errors: @session.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    def extend_time
      minutes = params[:minutes].to_i
      if @session.extend_time!(minutes)
        render json: @session
      else
        render json: { error: 'Failed to extend time' }, status: :unprocessable_entity
      end
    end
    
    def join
      session = Session.find_by(code: params[:code])
      
      if session
        participant = session.add_participant(current_user)
        render json: {
          session: session,
          participant: participant
        }
      else
        render json: { error: 'Session not found' }, status: :not_found
      end
    end
    
    private
    
    def set_session
      @session = Session.find(params[:id])
      
      unless @session.is_participant?(current_user)
        render json: { error: 'Access denied' }, status: :forbidden
      end
    end
    
    def session_params
      params.require(:session).permit(
        :title, 
        :description, 
        :session_type, 
        :time_limit_minutes,
        :language,
        tags: []
      )
    end
  end
end
