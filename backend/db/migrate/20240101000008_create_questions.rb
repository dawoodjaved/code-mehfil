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
    
    # workspace_id is optional; no workspaces table in this app
    add_foreign_key :questions, :users, column: :created_by_id, on_delete: :nullify
  end
end

