class ApplicationController < ActionController::API
  before_action :authenticate_request
  attr_reader :current_user
  
  private
  
  def authenticate_request
    @current_user = AuthorizeApiRequest.call(request.headers).result
    render json: { error: 'Not Authorized' }, status: 401 unless @current_user
  rescue StandardError => e
    render json: { error: e.message }, status: 401
  end
  
  def authenticate_request_optional
    @current_user = AuthorizeApiRequest.call(request.headers).result
  rescue StandardError
    @current_user = nil
  end
end
