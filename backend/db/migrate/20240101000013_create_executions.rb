class CreateExecutions < ActiveRecord::Migration[7.2]
  def change
    create_table :executions, id: :string do |t|
      t.string :session_id, null: false, index: true
      t.string :file_id, index: true
      t.integer :language, null: false
      t.text :code, null: false
      t.text :input
      t.integer :status, default: 0 # PENDING
      t.text :output
      t.text :error
      t.integer :exit_code
      t.integer :execution_time
      t.integer :memory_used
      t.datetime :created_at, default: -> { "CURRENT_TIMESTAMP" }
      t.datetime :completed_at
      
      t.index :status
      t.index :created_at
    end
    
    add_foreign_key :executions, :sessions, column: :session_id, on_delete: :cascade
    add_foreign_key :executions, :session_files, column: :file_id, on_delete: :nullify
  end
end

