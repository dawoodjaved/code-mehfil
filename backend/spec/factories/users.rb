FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "User #{n}" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }
    last_seen_at { Time.current }
    
    trait :with_sessions do
      after(:create) do |user|
        create_list(:session, 3, created_by: user)
      end
    end
  end
end

