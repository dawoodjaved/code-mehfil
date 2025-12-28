FactoryBot.define do
  factory :question do
    sequence(:title) { |n| "Question #{n}" }
    description { "Write a function that solves this problem..." }
    difficulty { :easy }
    category { :algorithms }
    time_limit_minutes { 15 }
    tags { ["arrays", "strings"] }
    starter_code do
      {
        "javascript" => "function solution() {\n  // Your code here\n}",
        "python" => "def solution():\n    # Your code here\n    pass"
      }
    end
    
    association :created_by, factory: :user
    
    trait :medium do
      difficulty { :medium }
      time_limit_minutes { 25 }
    end
    
    trait :hard do
      difficulty { :hard }
      time_limit_minutes { 45 }
    end
    
    trait :with_test_cases do
      after(:create) do |question|
        create_list(:test_case, 3, question: question)
      end
    end
  end
end

