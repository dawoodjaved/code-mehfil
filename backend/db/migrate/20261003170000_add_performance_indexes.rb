# frozen_string_literal: true

class AddPerformanceIndexes < ActiveRecord::Migration[7.2]
  def change
    # session_participants — hottest authz path (is_participant? / find_by user)
    # Indexes from the original create migration were missing from the live schema.
    add_index :session_participants, :session_id,
              name: "idx_session_participants_session",
              if_not_exists: true
    add_index :session_participants, :user_id,
              name: "idx_session_participants_user",
              if_not_exists: true
    add_index :session_participants, [:session_id, :user_id],
              unique: true,
              name: "idx_session_participants_session_user",
              if_not_exists: true

    # Chat history is always scoped by session and ordered by time
    add_index :chat_messages, [:session_id, :created_at],
              name: "idx_chat_messages_session_created",
              if_not_exists: true

    # User execution history: current_user.executions.recent
    add_index :executions, :user_id,
              name: "idx_executions_user",
              if_not_exists: true
    add_index :executions, [:user_id, :created_at],
              name: "idx_executions_user_created",
              if_not_exists: true

    # Session list ordering
    add_index :sessions, :created_at,
              name: "idx_sessions_created_at",
              if_not_exists: true

    # JSONB key existence checks for starter_code language filter
    add_index :questions, :starter_code,
              using: :gin,
              name: "idx_questions_starter_code_gin",
              if_not_exists: true
  end
end
