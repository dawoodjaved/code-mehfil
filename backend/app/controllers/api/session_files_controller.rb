module Api
  class SessionFilesController < ApplicationController
    include SessionAccess

    before_action :set_session
    before_action :set_file, only: [:show, :update, :destroy]
    
    def index
      # Explicit order keeps list stable; content is needed by the editor bootstrap
      files = @session.files.order(:path)
      render json: files
    end
    
    def show
      render json: @file
    end
    
    def create
      filename = sanitize_filename(params[:filename].presence || "untitled")
      path = sanitize_path(params[:path].presence || "/#{filename}", filename)
      content = params[:content].to_s
      content = content.byteslice(0, 1_000_000) if content.bytesize > 1_000_000

      file = @session.files.build(
        filename: filename,
        path: path,
        language: params[:language].presence || "javascript",
        content: content,
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

    def sanitize_filename(name)
      base = File.basename(name.to_s).gsub(/[^\w.\-+=@]/, "_")
      base = "untitled" if base.blank? || base == "." || base == ".."
      base[0, 255]
    end

    def sanitize_path(raw, filename)
      cleaned = raw.to_s.gsub("\\", "/").split("/").reject { |p| p.empty? || p == "." || p == ".." }
      cleaned = [filename] if cleaned.empty?
      "/" + cleaned.map { |p| sanitize_filename(p) }.join("/")
    end
  end
end

