FactoryBot.define do
  factory :chat_message do
    content { "Hello, this is a test message!" }
    message_type { :text }
    
    association :session
    association :user
    
    trait :system do
      message_type { :system }
      content { "User joined the session" }
    end
    
    trait :code do
      message_type { :code }
      content { "console.log('test');" }
    end
  end
end

