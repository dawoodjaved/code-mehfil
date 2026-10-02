require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"

# Bundler must load gems before ActionCable engine is required.
Bundler.require(*Rails.groups)

begin
  require "action_cable/engine"
rescue LoadError => e
  warn "Warning: ActionCable not available: #{e.message}"
end

module CodemehfilBackend
  class Application < Rails::Application
    config.load_defaults 7.2
    config.api_only = true

    # Load lib directory
    config.autoload_paths << Rails.root.join("lib")
    config.eager_load_paths << Rails.root.join("lib")

    # ActionCable configuration
    if defined?(ActionCable)
      port = ENV.fetch("PORT", "4000")
      config.action_cable.mount_path = "/cable"
      config.action_cable.url = ENV.fetch("ACTION_CABLE_URL", "ws://localhost:#{port}/cable")

      origins = ENV.fetch(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3003,http://localhost:3005,http://localhost:3006"
      ).split(",").map(&:strip).reject(&:empty?)

      config.action_cable.allowed_request_origins = if origins.any?
        origins + [/http:\/\/localhost:\d+/]
      else
        [
          "http://localhost:3000",
          "http://localhost:3003",
          "http://localhost:3005",
          /http:\/\/localhost:\d+/
        ]
      end
    end

    config.time_zone = "UTC"
    config.active_record.default_timezone = :utc

    config.middleware.use Rack::Attack
  end
end
