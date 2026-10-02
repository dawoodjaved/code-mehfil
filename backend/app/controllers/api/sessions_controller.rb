module Api
  class SessionsController < ApplicationController
    include SessionAccess

    before_action :set_session, only: [:show, :update, :destroy, :start, :complete, :extend_time]
    before_action :require_session_owner!, only: [:update, :destroy, :start, :complete]
    
    def index
      sessions = Session.where(
        id: SessionParticipant.where(user: current_user).select(:session_id)
      ).or(
        Session.where(created_by: current_user)
      ).includes(:created_by, :participants).recent
      
      render json: sessions.as_json(
        include: {
          created_by: { only: [:id, :name, :email] },
          participants: {
            include: { user: { only: [:id, :name, :email] } }
          }
        },
        methods: [:session_type, :status]
      )
    end
    
    def show
      render json: @session.as_json(
        include: {
          created_by: { only: [:id, :name, :email] },
          participants: {
            include: { user: { only: [:id, :name, :email] } }
          },
          files: { only: [:id, :filename, :path, :language, :content, :created_at, :updated_at] },
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
      unless minutes.positive? && minutes <= 180
        render json: { error: "Invalid extension (1–180 minutes)" }, status: :unprocessable_entity
        return
      end

      # Hosts / interviewers may extend; participants cannot
      require_session_manager!
      return if performed?

      if @session.extend_time!(minutes)
        render json: @session
      else
        render json: { error: "Failed to extend time" }, status: :unprocessable_entity
      end
    end
    
    def join
      code = params[:code].to_s.strip.upcase
      if code.blank?
        render json: { error: "Session code is required" }, status: :unprocessable_entity
        return
      end

      session = Session.find_by(code: code)
      
      unless session
        render json: { error: "Session not found" }, status: :not_found
        return
      end

      if session.archived? || session.completed?
        render json: { error: "This session is closed and cannot be joined" }, status: :forbidden
        return
      end

      participant = session.add_participant(current_user)
      render json: {
        session: session,
        participant: participant
      }
    end
    
    private
    
    def set_session
      load_session_from_params!
      require_session_participant!
    end
    
    def session_params
      params.require(:session).permit(
        :title,
        :description,
        :session_type,
        :time_limit_minutes,
        :default_language,
        tags: []
      )
    end
  end
end
