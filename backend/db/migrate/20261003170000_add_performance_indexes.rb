# frozen_string_literal: true

class AddPerformanceIndexes < ActiveRecord::Migration[7.2]
  def change
    # session_participants — hottest authz path (is_participant? / find_by user)
    if table_exists?(:session_participants)
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
    end

    # Chat history is always scoped by session and ordered by time
    if table_exists?(:chat_messages)
      add_index :chat_messages, [:session_id, :created_at],
                name: "idx_chat_messages_session_created",
                if_not_exists: true
    end

    # User execution history: current_user.executions.recent
    if table_exists?(:executions) && column_exists?(:executions, :user_id)
      add_index :executions, :user_id,
                name: "idx_executions_user",
                if_not_exists: true
      add_index :executions, [:user_id, :created_at],
                name: "idx_executions_user_created",
                if_not_exists: true
    end

    # Session list ordering
    if table_exists?(:sessions)
      add_index :sessions, :created_at,
                name: "idx_sessions_created_at",
                if_not_exists: true
    end

    # JSONB key existence checks for starter_code language filter
    if table_exists?(:questions) && column_exists?(:questions, :starter_code)
      add_index :questions, :starter_code,
                using: :gin,
                name: "idx_questions_starter_code_gin",
                if_not_exists: true
    end
  end
end
