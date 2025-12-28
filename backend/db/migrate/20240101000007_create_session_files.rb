class CreateSessionFiles < ActiveRecord::Migration[7.2]
  def change
    create_table :session_files, id: :string do |t|
      t.string :session_id, null: false, index: true
      t.string :path, null: false
      t.text :content
      t.integer :language, null: false
      t.timestamps
      
      t.index [:session_id, :path], unique: true
    end
    
    add_foreign_key :session_files, :sessions, column: :session_id, on_delete: :cascade
  end
end

