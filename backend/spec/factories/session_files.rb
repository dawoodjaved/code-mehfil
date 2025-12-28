FactoryBot.define do
  factory :session_file do
    sequence(:filename) { |n| "file#{n}.js" }
    content { "// Your code here\n\nfunction example() {\n  return 'Hello World';\n}" }
    language { "javascript" }
    
    association :session
    association :created_by, factory: :user
    
    trait :python do
      filename { "main.py" }
      content { "# Python code\n\ndef example():\n    return 'Hello World'" }
      language { "python" }
    end
    
    trait :empty do
      content { "" }
    end
  end
end

