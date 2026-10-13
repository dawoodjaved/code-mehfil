# Fail fast in production if critical secrets are missing or weak.
Rails.application.config.after_initialize do
  next unless Rails.env.production?

  missing = []
  missing << "DATABASE_URL" if ENV["DATABASE_URL"].blank?
  missing << "JWT_SECRET or SECRET_KEY_BASE" if ENV["JWT_SECRET"].blank? && ENV["SECRET_KEY_BASE"].blank?

  if missing.any?
    raise "Refusing to start in production — missing env: #{missing.join(', ')}. See .env.example."
  end

  JsonWebToken.secret_key
end
