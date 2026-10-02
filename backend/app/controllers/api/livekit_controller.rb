# frozen_string_literal: true

require "jwt"

module Api
  class LivekitController < ApplicationController
    include SessionAccess

    # Auth required — no anonymous tokens
    def token
      room_name = params[:roomName].presence || params[:room_name].presence
      unless room_name.present?
        render json: { error: "roomName is required" }, status: :unprocessable_entity
        return
      end

      # Room name is the session id in this app
      @session = Session.find_by(id: room_name)
      unless @session
        render json: { error: "Session not found" }, status: :not_found
        return
      end

      require_session_participant!
      return if performed?

      identity = current_user.id.to_s
      display_name = current_user.name.presence || current_user.email.presence || identity
      api_key = ENV["LIVEKIT_API_KEY"].presence
      api_secret = ENV["LIVEKIT_API_SECRET"].presence
      livekit_url = ENV["LIVEKIT_URL"].presence || ENV["NEXT_PUBLIC_LIVEKIT_URL"].presence || "ws://localhost:7880"

      if api_key.present? && api_secret.present?
        now = Time.now.to_i
        payload = {
          iss: api_key,
          sub: identity,
          name: display_name.to_s,
          nbf: now - 10,
          exp: now + 6.hours.to_i,
          video: {
            roomJoin: true,
            room: room_name,
            canPublish: true,
            canSubscribe: true
          }
        }
        token = JWT.encode(payload, api_secret, "HS256")
        render json: {
          token: token,
          roomName: room_name,
          livekitUrl: livekit_url,
          mock: false,
          expiresAt: Time.at(now + 6.hours.to_i).iso8601
        }
      else
        # Still only for authenticated participants — local preview token
        render json: {
          token: "mock-token-#{room_name}-#{current_user.id}",
          roomName: room_name,
          livekitUrl: nil,
          mock: true,
          message: "LIVEKIT_API_KEY/SECRET not set — local camera preview only",
          expiresAt: 6.hours.from_now.iso8601
        }
      end
    end
  end
end
