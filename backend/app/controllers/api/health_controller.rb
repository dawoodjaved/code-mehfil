module Api
  class HealthController < ApplicationController
    skip_before_action :authenticate_request

    def index
      # Minimal probe — avoid leaking service/version details
      render json: {
        status: "ok",
        timestamp: Time.current.utc.iso8601
      }
    end
  end
end
