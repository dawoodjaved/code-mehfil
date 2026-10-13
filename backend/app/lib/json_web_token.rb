class JsonWebToken
  WEAK_DEFAULTS = [
    "your_secret_key",
    "your_secret_key_change_this_in_production",
    "change-me-to-a-long-random-string-at-least-32-chars",
    "secret",
    "changeme"
  ].freeze

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, secret_key)
  end

  def self.decode(token)
    decoded = JWT.decode(token, secret_key)[0]
    HashWithIndifferentAccess.new decoded
  rescue JWT::DecodeError => e
    raise e
  end

  def self.secret_key
    @secret_key ||= resolve_secret_key
  end

  def self.resolve_secret_key
    candidates = [ENV["JWT_SECRET"].presence, Rails.application.secret_key_base].compact
    key = candidates.find { |k| strong_secret?(k) }

    if key.blank?
      raise KeyError,
            "JWT_SECRET (or Rails secret_key_base) must be a strong random value (32+ chars). " \
            "Rotate any previously hardcoded secrets immediately."
    end

    if ENV["JWT_SECRET"].present? && !strong_secret?(ENV["JWT_SECRET"])
      if Rails.env.production?
        raise KeyError, "JWT_SECRET is weak or a known placeholder — set a strong random value (32+ chars)."
      end
      Rails.logger.warn("[security] JWT_SECRET looks like a placeholder; using Rails secret_key_base instead")
    end

    key
  end
  private_class_method :resolve_secret_key

  def self.strong_secret?(key)
    key.present? && key.to_s.length >= 32 && !WEAK_DEFAULTS.include?(key.to_s)
  end
  private_class_method :strong_secret?
end
