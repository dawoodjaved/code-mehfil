class CreateTestCases < ActiveRecord::Migration[7.2]
  def change
    create_table :test_cases, id: :string do |t|
      t.string :question_id, null: false, index: true
      t.text :input, null: false
      t.text :expected_output, null: false
      t.boolean :is_public, default: true
      t.integer :order, default: 0
      t.datetime :created_at, default: -> { "CURRENT_TIMESTAMP" }
    end
    
    add_foreign_key :test_cases, :questions, column: :question_id, on_delete: :cascade
  end
end

