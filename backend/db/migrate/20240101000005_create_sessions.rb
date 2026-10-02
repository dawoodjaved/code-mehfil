class CreateSessions < ActiveRecord::Migration[7.2]
  def change
    create_table :sessions, id: :string do |t|
      t.string :title, null: false
      t.text :description
      t.integer :session_type, default: 0 # COLLABORATION
      t.integer :status, default: 0 # DRAFT
      t.string :workspace_id, index: true
      t.string :created_by_id, null: false, index: true
      t.datetime :started_at
      t.datetime :ended_at
      
      # Interview specific
      t.string :interview_link, index: { unique: true }
      t.string :interview_password
      t.datetime :interview_expires_at
      t.integer :timer_seconds
      t.integer :time_extension
      
      # Recording
      t.string :recording_url
      t.datetime :recording_started_at
      
      t.timestamps
      
      t.index :status
    end
    
    # workspace_id is optional; no workspaces table in this app
    add_foreign_key :sessions, :users, column: :created_by_id
  end
end

