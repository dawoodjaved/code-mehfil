class CreateSessionQuestions < ActiveRecord::Migration[7.2]
  def change
    create_table :session_questions, id: :string do |t|
      t.string :session_id, null: false, index: true
      t.string :question_id, null: false
      t.datetime :assigned_at, default: -> { "CURRENT_TIMESTAMP" }
      t.datetime :completed_at
      
      t.index [:session_id, :question_id], unique: true
    end
    
    add_foreign_key :session_questions, :sessions, column: :session_id, on_delete: :cascade
    add_foreign_key :session_questions, :questions, column: :question_id, on_delete: :cascade
  end
end

