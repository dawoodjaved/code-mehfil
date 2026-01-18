module Api
  class SessionFilesController < ApplicationController
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
      file = @session.files.build(
        filename: params[:filename],
        language: params[:language],
        content: params[:content] || '',
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
      @session = Session.find(params[:session_id])
      
      unless @session.is_participant?(current_user)
        render json: { error: 'Access denied' }, status: :forbidden
      end
    end
    
    def set_file
      @file = @session.files.find(params[:id])
    end
    
    def broadcast_file_created(file)
      return unless defined?(ActionCable)
      begin
        channel_class = begin
          SessionsChannel
        rescue NameError
          nil
        end
        
        if channel_class
          channel_class.broadcast_to(
            @session,
            type: 'file_created',
            file: file.as_json
          )
        end
      rescue => e
        Rails.logger.warn "Failed to broadcast file created: #{e.message}"
      end
    end
  end
end
