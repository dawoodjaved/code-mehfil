FactoryBot.define do
  factory :session_question do
    status { :pending }
    
    association :session
    association :question
    
    trait :in_progress do
      status { :in_progress }
      started_at { Time.current }
    end
    
    trait :completed do
      status { :completed }
      started_at { 30.minutes.ago }
      completed_at { Time.current }
      time_taken_seconds { 1800 }
    end
  end
end

