FactoryBot.define do
  factory :session_participant do
    role { :participant }
    last_seen_at { Time.current }
    cursor_position { { line: 1, column: 1 }.to_json }
    
    association :session
    association :user
    
    trait :owner do
      role { :owner }
    end
    
    trait :interviewer do
      role { :interviewer }
    end
    
    trait :candidate do
      role { :candidate }
    end
  end
end

