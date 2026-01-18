max_threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
min_threads_count = ENV.fetch("RAILS_MIN_THREADS") { max_threads_count }
threads min_threads_count, max_threads_count

port ENV.fetch("PORT") { 4000 }
environment ENV.fetch("RAILS_ENV") { "development" }
pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }

# Disable workers in development to avoid fork() issues on macOS
workers ENV.fetch("WEB_CONCURRENCY") { ENV["RAILS_ENV"] == "production" ? 2 : 0 }
preload_app! if ENV.fetch("WEB_CONCURRENCY", "0").to_i > 0

plugin :tmp_restart

