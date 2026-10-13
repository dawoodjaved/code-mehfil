module Api
  class SessionParticipantsController < ApplicationController
    include SessionAccess

    # Never allow "owner" via API — prevents privilege escalation
    ASSIGNABLE_ROLES = %w[participant interviewer candidate].freeze

    before_action :set_session
    before_action :require_session_manager!, only: [:create, :update, :destroy]

    def index
      participants = @session.participants.includes(:user)
      render json: participants.as_json(
        include: { user: { only: [:id, :name, :email] } }
      )
    end

    def create
      user = User.find_by(email: params[:email].to_s.strip.downcase)

      unless user
        render json: { error: "User not found — they must create an account first" }, status: :not_found
        return
      end

      role = sanitize_assignable_role(params[:role])
      participant = @session.add_participant(user, role: role)

      render json: participant.as_json(
        include: { user: { only: [:id, :name, :email] } }
      ), status: :created
    end

    def update
      participant = @session.participants.find(params[:id])

      if participant.owner? || participant.user_id == @session.created_by_id
        render json: { error: "Cannot change the session owner's role" }, status: :unprocessable_entity
        return
      end

      role = sanitize_assignable_role(params[:role])
      if participant.update(role: role)
        render json: participant.as_json(
          include: { user: { only: [:id, :name, :email] } }
        )
      else
        render json: { errors: participant.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      participant = @session.participants.find(params[:id])
      if participant.user_id == @session.created_by_id || participant.owner?
        render json: { error: "Cannot remove the session owner" }, status: :unprocessable_entity
        return
      end
      participant.destroy
      head :no_content
    end

    private

    def set_session
      load_session_from_params!
      require_session_participant!
    end

    def sanitize_assignable_role(role)
      value = role.to_s
      return "participant" unless ASSIGNABLE_ROLES.include?(value)

      value
    end
  end
end
