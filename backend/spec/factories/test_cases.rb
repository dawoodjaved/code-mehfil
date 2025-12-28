FactoryBot.define do
  factory :test_case do
    input { "[1, 2, 3], 5" }
    expected_output { "2" }
    is_hidden { false }
    
    association :question
    
    trait :hidden do
      is_hidden { true }
    end
  end
end

