class ApplicationCable::Connection < ActionCable::Connection::Base
  identified_by :current_user
  
  def connect
    self.current_user = find_verified_user
  end
  
  private
  
  def find_verified_user
    token = request.params[:token] || request.headers['Authorization']&.split(' ')&.last
    
    if token
      begin
        decoded_token = JsonWebToken.decode(token)
        user = User.find(decoded_token[:user_id])
        user.update_last_seen!
        user
      rescue
        reject_unauthorized_connection
      end
    else
      reject_unauthorized_connection
    end
  end
end
