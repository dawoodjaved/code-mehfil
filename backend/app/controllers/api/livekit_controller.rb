module Api
  class LivekitController < ApplicationController
    skip_before_action :authenticate_request, only: [:token]
    before_action :authenticate_request_optional, only: [:token]
    
    def token
      room_name = params[:roomName] || params[:room_name]
      
      if room_name.blank?
        render json: { error: "roomName is required" }, status: :bad_request
        return
      end

      # For now, return a mock token
      # In production, integrate with LiveKit SDK to generate real tokens
      token = "mock-token-#{room_name}-#{Time.current.to_i}"
      
      render json: { 
        token: token,
        roomName: room_name,
        expiresAt: (Time.current + 24.hours).iso8601
      }
    rescue => e
      render json: { error: e.message }, status: :internal_server_error
    end
  end
end
