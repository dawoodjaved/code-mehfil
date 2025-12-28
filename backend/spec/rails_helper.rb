# Test environment
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rspec/rails'
require 'factory_bot_rails'

# Prevent database truncation if the environment is production
abort("The Rails environment is running in production mode!") if Rails.env.production?

begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  puts e.to_s.strip
  exit 1
end

RSpec.configure do |config|
  # Include FactoryBot methods
  config.include FactoryBot::Syntax::Methods
  
  # Use transactional fixtures
  config.use_transactional_fixtures = true
  
  # Infer spec type from file location
  config.infer_spec_type_from_file_location!
  
  # Filter lines from Rails gems in backtraces
  config.filter_rails_from_backtrace!
  
  # Database cleaner
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end
  
  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end
  
  # Helper method for authenticated requests
  config.include Module.new {
    def auth_header(user)
      token = JsonWebToken.encode(user_id: user.id)
      { 'Authorization' => "Bearer #{token}" }
    end
    
    def json_response
      JSON.parse(response.body)
    end
  }, type: :request
  
  # Disable monkey patching
  config.disable_monkey_patching!
  
  # Use color output
  config.color = true
  
  # Use documentation format
  config.formatter = :documentation
  
  # Order tests randomly
  config.order = :random
  Kernel.srand config.seed
end

