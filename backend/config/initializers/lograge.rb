Rails.application.configure do
  config.lograge.enabled = true
  config.lograge.formatter = Lograge::Formatters::Json.new
  
  config.lograge.custom_options = lambda do |event|
    {
      time: event.time,
      remote_ip: event.payload[:remote_ip],
      params: event.payload[:params].except('controller', 'action', 'format', 'utf8', 'authenticity_token')
    }
  end
end
