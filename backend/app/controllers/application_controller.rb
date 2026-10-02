class ApplicationController < ActionController::API
  before_action :authenticate_request
  attr_reader :current_user
  
  private
  
  def authenticate_request
    result = AuthorizeApiRequest.call(request.headers)
    @current_user = result[:result]
    render json: { error: 'Not Authorized' }, status: 401 unless @current_user
  rescue StandardError => e
    render json: { error: e.message }, status: 401
  end
  
  def authenticate_request_optional
    result = AuthorizeApiRequest.call(request.headers)
    @current_user = result[:result]
  rescue StandardError
    @current_user = nil
  end
end
