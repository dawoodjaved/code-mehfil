class CreateQuestions < ActiveRecord::Migration[7.2]
  def change
    create_table :questions, id: :string do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.integer :difficulty, null: false, index: true
      t.string :topics, array: true, default: []
      t.string :workspace_id, index: true
      t.string :created_by_id, null: false
      t.timestamps
    end
    
    add_foreign_key :questions, :workspaces, column: :workspace_id, on_delete: :nullify
    add_foreign_key :questions, :users, column: :created_by_id, on_delete: :nullify
  end
end

