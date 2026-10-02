# Clear existing data (use delete_all to avoid callback/enum load issues on empty/partial DBs)
puts "Clearing existing data..."
[Execution, ChatMessage, SessionQuestion, TestCase, SessionFile, SessionParticipant, Session, Question, User].each do |model|
  model.delete_all
end

puts "Creating users..."
users = [
  User.create!(
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    password_confirmation: "password123"
  ),
  User.create!(
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    password_confirmation: "password123"
  ),
  User.create!(
    name: "Bob Johnson",
    email: "bob@example.com",
    password: "password123",
    password_confirmation: "password123"
  )
]

puts "Created #{users.count} users"

puts "Creating questions..."
questions = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: :easy,
    category: :algorithms,
    time_limit_minutes: 15,
    starter_code: {
      "javascript" => "function twoSum(nums, target) {\n  // Your code here\n}",
      "python" => "def two_sum(nums, target):\n    # Your code here\n    pass",
      "java" => "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}"
    },
    test_cases: [
      { input: "[2,7,11,15], 9", expected_output: "[0,1]" },
      { input: "[3,2,4], 6", expected_output: "[1,2]" },
      { input: "[3,3], 6", expected_output: "[0,1]" }
    ]
  },
  {
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters.",
    difficulty: :easy,
    category: :algorithms,
    time_limit_minutes: 10,
    starter_code: {
      "javascript" => "function reverseString(s) {\n  // Your code here\n}",
      "python" => "def reverse_string(s):\n    # Your code here\n    pass"
    },
    test_cases: [
      { input: '["h","e","l","l","o"]', expected_output: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', expected_output: '["h","a","n","n","a","H"]' }
    ]
  },
  {
    title: "Valid Palindrome",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
    difficulty: :easy,
    category: :algorithms,
    time_limit_minutes: 15,
    starter_code: {
      "javascript" => "function isPalindrome(s) {\n  // Your code here\n}",
      "python" => "def is_palindrome(s):\n    # Your code here\n    pass"
    },
    test_cases: [
      { input: '"A man, a plan, a canal: Panama"', expected_output: "true" },
      { input: '"race a car"', expected_output: "false" }
    ]
  },
  {
    title: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
    difficulty: :medium,
    category: :algorithms,
    time_limit_minutes: 20,
    starter_code: {
      "javascript" => "function search(nums, target) {\n  // Your code here\n}",
      "python" => "def search(nums, target):\n    # Your code here\n    pass"
    },
    test_cases: [
      { input: "[-1,0,3,5,9,12], 9", expected_output: "4" },
      { input: "[-1,0,3,5,9,12], 2", expected_output: "-1" }
    ]
  },
  {
    title: "Merge Two Sorted Lists",
    description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.",
    difficulty: :medium,
    category: :data_structures,
    time_limit_minutes: 25,
    starter_code: {
      "javascript" => "function mergeTwoLists(list1, list2) {\n  // Your code here\n}",
      "python" => "def merge_two_lists(list1, list2):\n    # Your code here\n    pass"
    },
    test_cases: [
      { input: "[1,2,4], [1,3,4]", expected_output: "[1,1,2,3,4,4]" },
      { input: "[], []", expected_output: "[]" }
    ]
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: :medium,
    category: :data_structures,
    time_limit_minutes: 20,
    starter_code: {
      "javascript" => "function isValid(s) {\n  // Your code here\n}",
      "python" => "def is_valid(s):\n    # Your code here\n    pass"
    },
    test_cases: [
      { input: '"()"', expected_output: "true" },
      { input: '"()[]{}"', expected_output: "true" },
      { input: '"(]"', expected_output: "false" }
    ]
  },
  {
    title: "Design a URL Shortener",
    description: "Design a system that can generate short URLs and redirect users to the original URLs. Explain your approach including database schema, API design, and how you handle collisions.",
    difficulty: :hard,
    category: :system_design,
    time_limit_minutes: 45,
    starter_code: {
      "javascript" => "// Explain your system design approach\n// Include: Database schema, API endpoints, scaling considerations",
      "python" => "# Explain your system design approach\n# Include: Database schema, API endpoints, scaling considerations"
    },
    test_cases: []
  },
  {
    title: "Implement LRU Cache",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
    difficulty: :hard,
    category: :data_structures,
    time_limit_minutes: 35,
    starter_code: {
      "javascript" => "class LRUCache {\n  constructor(capacity) {\n    // Your code here\n  }\n\n  get(key) {\n    // Your code here\n  }\n\n  put(key, value) {\n    // Your code here\n  }\n}",
      "python" => "class LRUCache:\n    def __init__(self, capacity):\n        # Your code here\n        pass\n\n    def get(self, key):\n        # Your code here\n        pass\n\n    def put(self, key, value):\n        # Your code here\n        pass"
    },
    test_cases: [
      { input: 'LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2)', expected_output: '1, -1' }
    ]
  }
]

questions.each do |q_data|
  test_cases_data = q_data.delete(:test_cases)
  question = users.first.questions_created.create!(q_data)
  
  test_cases_data.each do |tc|
    question.test_cases.create!(tc)
  end
  
  puts "  Created question: #{question.title}"
end

puts "Created #{Question.count} questions with test cases"

puts "Creating sample sessions..."
session1 = Session.create!(
  title: "Mock Interview - Algorithms",
  description: "Practice session for algorithm questions",
  session_type: :interview,
  status: :draft,
  created_by: users.first,
  time_limit_minutes: 60,
  tags: ["algorithms", "interview", "javascript"]
)

session2 = Session.create!(
  title: "Pair Programming - LeetCode",
  description: "Let's solve some LeetCode problems together",
  session_type: :collaboration,
  status: :active,
  created_by: users.second,
  tags: ["pair-programming", "leetcode"]
)

puts "Created #{Session.count} sessions"

puts "Adding sample files..."
session1.files.create!(
  filename: "solution.js",
  language: "javascript",
  content: "// Write your solution here\n\nfunction twoSum(nums, target) {\n  \n}",
  created_by: users.first
)

session2.files.create!(
  filename: "main.py",
  language: "python",
  content: "# Python solution\n\ndef reverse_string(s):\n    pass",
  created_by: users.second
)

puts "Created #{SessionFile.count} session files"

puts "Adding chat messages..."
session1.chat_messages.create!(
  user: users.first,
  content: "Let's start with the Two Sum problem",
  message_type: :text
)

session2.chat_messages.create!(
  user: users.second,
  content: "Ready to code!",
  message_type: :text
)

puts "Created #{ChatMessage.count} chat messages"

puts "\n✅ Seed data created successfully!"
puts "\n📊 Summary:"
puts "  - #{User.count} users"
puts "  - #{Question.count} questions"
puts "  - #{TestCase.count} test cases"
puts "  - #{Session.count} sessions"
puts "  - #{SessionFile.count} files"
puts "  - #{ChatMessage.count} messages"

puts "\n👤 Test Users:"
puts "  Email: john@example.com | Password: password123"
puts "  Email: jane@example.com | Password: password123"
puts "  Email: bob@example.com | Password: password123"
