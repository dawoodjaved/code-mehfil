class CreateChatMessages < ActiveRecord::Migration[7.2]
  def change
    create_table :chat_messages, id: :string do |t|
      t.string :session_id, null: false, index: true
      t.string :user_id, null: false, index: true
      t.text :content, null: false
      t.string :type, default: "TEXT"
      t.datetime :created_at, default: -> { "CURRENT_TIMESTAMP" }
      
      t.index :created_at
    end
    
    add_foreign_key :chat_messages, :sessions, column: :session_id, on_delete: :cascade
    add_foreign_key :chat_messages, :users, column: :user_id, on_delete: :cascade
  end
end

