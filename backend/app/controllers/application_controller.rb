class ApplicationController < ActionController::API
  before_action :authenticate_request
  attr_reader :current_user
  
  private
  
  def authenticate_request
    result = AuthorizeApiRequest.call(request.headers)
    @current_user = result[:result]
    render json: { error: "Not Authorized" }, status: :unauthorized unless @current_user
  rescue ExceptionHandler::AuthenticationError, JWT::DecodeError
    render json: { error: "Not Authorized" }, status: :unauthorized
  rescue StandardError => e
    # Do not leak exception details to clients (token internals, DB errors, etc.)
    Rails.logger.warn("[auth] #{e.class}: #{e.message}")
    render json: { error: "Not Authorized" }, status: :unauthorized
  end
  
  def authenticate_request_optional
    result = AuthorizeApiRequest.call(request.headers)
    @current_user = result[:result]
  rescue StandardError
    @current_user = nil
  end
end
