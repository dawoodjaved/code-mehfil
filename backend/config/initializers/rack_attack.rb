# Attacker-facing abuse controls (brute force, mass signup, join guessing, exec flood).
# Middleware is mounted in config/application.rb.

class Rack::Attack
  throttle("req/ip", limit: 300, period: 60) do |req|
    req.ip if req.path.start_with?("/api/")
  end

  # Login bypass / credential stuffing
  throttle("logins/ip", limit: 5, period: 60) do |req|
    req.ip if req.path == "/api/auth/login" && req.post?
  end

  throttle("logins/email", limit: 5, period: 60) do |req|
    if req.path == "/api/auth/login" && req.post?
      req.params["email"].to_s.downcase.gsub(/\s+/, "").presence
    end
  end

  # Mass account creation
  throttle("registers/ip", limit: 10, period: 1.hour) do |req|
    req.ip if req.path == "/api/auth/register" && req.post?
  end

  # Session code brute-force
  throttle("joins/ip", limit: 20, period: 60) do |req|
    req.ip if req.path == "/api/sessions/join" && req.post?
  end

  # Execution / storage fill
  throttle("executions/ip", limit: 30, period: 60) do |req|
    req.ip if req.path.match?(%r{\A/api/sessions/[^/]+/executions\z}) && req.post?
  end

  self.throttled_responder = lambda do |_req|
    [
      429,
      { "Content-Type" => "application/json" },
      [{ error: "Too many requests. Please try again later." }.to_json]
    ]
  end
end
