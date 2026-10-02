module Api
  class SessionFilesController < ApplicationController
    include SessionAccess

    before_action :set_session
    before_action :set_file, only: [:show, :update, :destroy]
    
    def index
      files = @session.files
      render json: files
    end
    
    def show
      render json: @file
    end
    
    def create
      filename = params[:filename].presence || "untitled"
      file = @session.files.build(
        filename: filename,
        path: params[:path].presence || "/#{filename}",
        language: params[:language].presence || "javascript",
        content: params[:content] || "",
        created_by: current_user
      )
      
      if file.save
        broadcast_file_created(file)
        render json: file, status: :created
      else
        render json: { errors: file.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    def update
      if @file.update_content(params[:content], user_id: current_user.id)
        render json: @file
      else
        render json: { errors: @file.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    def destroy
      @file.destroy
      head :no_content
    end
    
    private
    
    def set_session
      load_session_from_params!
      require_session_participant!
    end
    
    def set_file
      return if performed?
      @file = @session.files.find(params[:id])
    end
    
    def broadcast_file_created(file)
      return unless defined?(ActionCable)
      begin
        if defined?(SessionsChannel)
          SessionsChannel.broadcast_to(
            @session,
            type: "file_created",
            file: file.as_json
          )
        end
      rescue => e
        Rails.logger.warn "Failed to broadcast file created: #{e.message}"
      end
    end
  end
end
