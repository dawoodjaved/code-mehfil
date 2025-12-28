use Rack::Attack

# Throttle all requests by IP (60rpm)
Rack::Attack.throttle("req/ip", limit: 300, period: 60) do |req|
  req.ip
end

# Throttle login attempts by email
Rack::Attack.throttle("logins/email", limit: 5, period: 20.seconds) do |req|
  if req.path == '/api/auth/login' && req.post?
    req.params['email'].to_s.downcase.gsub(/\s+/, "").presence
  end
end

# Block requests from suspicious IPs
Rack::Attack.blocklist("block suspicious requests") do |req|
  # Block if too many requests
  Rack::Attack::Allow2Ban.filter(req.ip, maxretry: 20, findtime: 10.minutes, bantime: 1.hour) do
    req.path.include?('/api/')
  end
end
