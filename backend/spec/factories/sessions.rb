FactoryBot.define do
  factory :session do
    sequence(:title) { |n| "Session #{n}" }
    description { "Test session description" }
    session_type { :collaboration }
    status { :draft }
    language { "javascript" }
    time_limit_minutes { 60 }
    tags { ["test", "coding"] }
    
    association :created_by, factory: :user
    
    trait :interview do
      session_type { :interview }
      time_limit_minutes { 45 }
    end
    
    trait :active do
      status { :active }
      started_at { Time.current }
    end
    
    trait :completed do
      status { :completed }
      started_at { 1.hour.ago }
      ended_at { Time.current }
    end
    
    trait :with_participants do
      after(:create) do |session|
        create_list(:session_participant, 2, session: session)
      end
    end
    
    trait :with_files do
      after(:create) do |session|
        create_list(:session_file, 2, session: session)
      end
    end
    
    trait :with_questions do
      after(:create) do |session|
        questions = create_list(:question, 2)
        questions.each do |question|
          create(:session_question, session: session, question: question)
        end
      end
    end
  end
end

