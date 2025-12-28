require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_cable/railtie"

Bundler.require(*Rails.groups)

module CodepairBackend
  class Application < Rails::Application
    config.load_defaults 7.2
    config.api_only = true
    
    # Load lib directory
    config.autoload_paths << Rails.root.join('lib')
    config.eager_load_paths << Rails.root.join('lib')
    
    # ActionCable configuration
    config.action_cable.mount_path = '/cable'
    config.action_cable.url = ENV.fetch("ACTION_CABLE_URL", "ws://localhost:4000/cable")
    config.action_cable.allowed_request_origins = [
      'http://localhost:3000',
      'http://localhost:3003',
      /http:\/\/localhost:.*/
    ]
    
    # Time zone
    config.time_zone = 'UTC'
    config.active_record.default_timezone = :utc
    
    # CORS will be configured in initializers/cors.rb
  end
end
