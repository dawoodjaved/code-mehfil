# frozen_string_literal: true

class AddPerformanceIndexes < ActiveRecord::Migration[7.2]
  def change
    # Production historically created executions without user_id (see CreateExecutions),
    # while the app model expects it. Align schema before indexing.
    unless column_exists?(:executions, :user_id)
      add_column :executions, :user_id, :string
    end

    # session_participants — hottest authz path (is_participant? / find_by user)
    add_index_safely :session_participants, :session_id,
                     name: "idx_session_participants_session"
    add_index_safely :session_participants, :user_id,
                     name: "idx_session_participants_user"
    add_index_safely :session_participants, [:session_id, :user_id],
                     unique: true,
                     name: "idx_session_participants_session_user"

    # Chat history is always scoped by session and ordered by time
    add_index_safely :chat_messages, [:session_id, :created_at],
                     name: "idx_chat_messages_session_created"

    # User execution history: current_user.executions.recent
    add_index_safely :executions, :user_id,
                     name: "idx_executions_user"
    add_index_safely :executions, [:user_id, :created_at],
                     name: "idx_executions_user_created"

    # Session list ordering
    add_index_safely :sessions, :created_at,
                     name: "idx_sessions_created_at"

    # JSONB key existence checks for starter_code language filter
    if column_exists?(:questions, :starter_code)
      add_index :questions, :starter_code,
                using: :gin,
                name: "idx_questions_starter_code_gin",
                if_not_exists: true
    end
  end

  private

  def add_index_safely(table, columns, **options)
    cols = Array(columns)
    return unless table_exists?(table)
    return unless cols.all? { |c| column_exists?(table, c) }

    add_index table, columns, **options.merge(if_not_exists: true)
  end
end
