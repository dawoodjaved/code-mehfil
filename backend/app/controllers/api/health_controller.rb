module Api
  class HealthController < ApplicationController
    skip_before_action :authenticate_request
    
    def index
      render json: {
        status: 'ok',
        timestamp: Time.current,
        service: 'CodeMehfil API',
        version: '1.0.0'
      }
    end
  end
end
