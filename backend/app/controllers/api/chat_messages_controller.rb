module Api
  class ChatMessagesController < ApplicationController
    include SessionAccess

    before_action :set_session

    def index
      messages = @session.chat_messages
                        .includes(:user)
                        .chronological
                        .limit(100)

      render json: messages.as_json(
        include: { user: { only: [:id, :name, :email] } }
      )
    end

    def create
      message = @session.chat_messages.build(
        user: current_user,
        content: params[:content],
        message_type: params[:message_type] || "text"
      )

      if message.save
        render json: message.as_json(
          include: { user: { only: [:id, :name, :email] } }
        ), status: :created
      else
        render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def set_session
      load_session_from_params!
      require_session_participant!
    end
  end
end
