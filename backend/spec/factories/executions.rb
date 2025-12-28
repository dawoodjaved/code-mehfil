FactoryBot.define do
  factory :execution do
    code { "console.log('Hello World');" }
    language { "javascript" }
    status { :pending }
    stdin { nil }
    
    association :session
    association :user
    association :session_file, factory: :session_file
    
    trait :running do
      status { :running }
    end
    
    trait :completed do
      status { :completed }
      output { "Hello World\n" }
      execution_time_ms { 45 }
      memory_kb { 2048 }
      completed_at { Time.current }
    end
    
    trait :failed do
      status { :failed }
      error { "SyntaxError: Unexpected token" }
      completed_at { Time.current }
    end
  end
end

