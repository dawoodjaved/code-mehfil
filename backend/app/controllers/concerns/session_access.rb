# frozen_string_literal: true

module SessionAccess
  extend ActiveSupport::Concern

  private

  def load_session_from_params!
    id = params[:session_id].presence || params[:id]
    @session = Session.find(id)
  end

  # Cache the membership row — most actions call participant/owner checks together
  def current_participant
    return @current_participant if defined?(@current_participant)

    @current_participant =
      if @session && current_user
        @session.participants.find_by(user_id: current_user.id)
      end
  end

  def require_session_participant!
    return if performed?
    return if current_participant.present?
    # Creator is always a participant after create; keep this as a cheap safety net
    return if @session&.created_by_id == current_user.id

    render json: { error: "Access denied — you are not a participant of this session" }, status: :forbidden
  end

  def require_session_owner!
    return if performed?

    participant = current_participant
    owner = participant&.owner? || @session.created_by_id == current_user.id
    return if owner

    render json: { error: "Only the session owner can do this" }, status: :forbidden
  end

  def require_session_manager!
    return if performed?

    participant = current_participant
    allowed =
      participant&.owner? ||
      participant&.interviewer? ||
      @session.created_by_id == current_user.id
    return if allowed

    render json: { error: "Only the host can manage participants" }, status: :forbidden
  end
end
