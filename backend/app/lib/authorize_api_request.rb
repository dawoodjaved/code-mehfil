class AuthorizeApiRequest
  def initialize(headers = {})
    @headers = headers
  end
  
  def call
    {
      result: user
    }
  end
  
  def self.call(headers)
    new(headers).call
  end
  
  private
  
  attr_reader :headers
  
  def user
    @user ||= User.find(decoded_auth_token[:user_id]) if decoded_auth_token
  rescue ActiveRecord::RecordNotFound => e
    raise(
      ExceptionHandler::InvalidToken,
      ("#{Message.invalid_token} #{e.message}")
    )
  end
  
  def decoded_auth_token
    @decoded_auth_token ||= JsonWebToken.decode(http_auth_header)
  end
  
  def http_auth_header
    if headers['Authorization'].present?
      return headers['Authorization'].split(' ').last
    end
    raise(ExceptionHandler::MissingToken, Message.missing_token)
  end
end

module ExceptionHandler
  class AuthenticationError < StandardError; end
  class MissingToken < AuthenticationError; end
  class InvalidToken < AuthenticationError; end
end

module Message
  def self.not_found(record = 'record')
    "Sorry, #{record} not found."
  end
  
  def self.invalid_credentials
    'Invalid credentials'
  end
  
  def self.invalid_token
    'Invalid token'
  end
  
  def self.missing_token
    'Missing token'
  end
  
  def self.unauthorized
    'Unauthorized request'
  end
  
  def self.account_created
    'Account created successfully'
  end
  
  def self.account_not_created
    'Account could not be created'
  end
  
  def self.expired_token
    'Sorry, your token has expired. Please login to continue.'
  end
end

