if defined?(ActionCable)
  Rails.application.config.action_cable.disable_request_forgery_protection = true
  ActionCable.server.config.logger = Logger.new(STDOUT)
end
