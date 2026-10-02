# frozen_string_literal: true

module SessionAccess
  extend ActiveSupport::Concern

  private

  def load_session_from_params!
    id = params[:session_id].presence || params[:id]
    @session = Session.find(id)
  end

  def require_session_participant!
    return if performed?
    return if @session.is_participant?(current_user)

    render json: { error: "Access denied — you are not a participant of this session" }, status: :forbidden
  end

  def require_session_owner!
    return if performed?

    participant = @session.participants.find_by(user: current_user)
    owner = participant&.owner? || @session.created_by_id == current_user.id
    return if owner

    render json: { error: "Only the session owner can do this" }, status: :forbidden
  end

  def require_session_manager!
    return if performed?

    participant = @session.participants.find_by(user: current_user)
    allowed =
      participant&.owner? ||
      participant&.interviewer? ||
      @session.created_by_id == current_user.id
    return if allowed

    render json: { error: "Only the host can manage participants" }, status: :forbidden
  end
end
