class CreateSessionParticipants < ActiveRecord::Migration[7.2]
  def change
    create_table :session_participants, id: :string do |t|
      t.string :session_id, null: false, index: true
      t.string :user_id, null: false, index: true
      t.string :role, default: "PARTICIPANT"
      t.datetime :joined_at, default: -> { "CURRENT_TIMESTAMP" }
      t.datetime :left_at
      t.boolean :video_enabled, default: false
      t.boolean :audio_enabled, default: false
      t.boolean :screen_sharing, default: false
      t.boolean :is_candidate, default: false
      t.text :interviewer_notes
      t.jsonb :rubric_scores
      t.timestamps
      
      t.index [:session_id, :user_id], unique: true
    end
    
    add_foreign_key :session_participants, :sessions, column: :session_id, on_delete: :cascade
    add_foreign_key :session_participants, :users, column: :user_id, on_delete: :cascade
  end
end

