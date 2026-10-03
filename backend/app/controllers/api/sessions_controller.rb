module Api
  class SessionsController < ApplicationController
    include SessionAccess

    before_action :set_session, only: [:update, :destroy, :start, :complete, :extend_time]
    before_action :set_session_for_show, only: [:show]
    before_action :require_session_owner!, only: [:update, :destroy, :start, :complete]

    def index
      uid = current_user.id
      participant_session_ids = SessionParticipant.where(user_id: uid).select(:session_id)

      sessions = Session
        .where(id: participant_session_ids)
        .or(Session.where(created_by_id: uid))
        .includes(:created_by, participants: :user)
        .recent
        .limit(100)

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
        participant: participant.as_json(
          include: { user: { only: [:id, :name, :email] } }
        )
      }
    end

    private

    def set_session
      load_session_from_params!
      require_session_participant!
    end

    # One query for authz + payload associations (avoids N+1 and double find)
    def set_session_for_show
      @session = Session.includes(
        :created_by,
        :files,
        :questions,
        participants: :user
      ).find(params[:id])
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
