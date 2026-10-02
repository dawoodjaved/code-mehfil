class AlignSchemaForCollabAndChat < ActiveRecord::Migration[7.2]
  LANGUAGE_NAMES = {
    0 => "javascript",
    1 => "typescript",
    2 => "python",
    3 => "java",
    4 => "cpp",
    5 => "c",
    6 => "go",
    7 => "rust",
    8 => "php",
    9 => "ruby",
    10 => "swift"
  }.freeze

  def up
    align_chat_messages
    align_questions
    align_session_files
    align_session_participants
  end

  def down
    # Irreversible alignment migration — restore from schema dump if needed.
    raise ActiveRecord::IrreversibleMigration
  end

  private

  def align_chat_messages
    unless column_exists?(:chat_messages, :message_type)
      add_column :chat_messages, :message_type, :integer, default: 0, null: false
    end

    if column_exists?(:chat_messages, :type)
      execute <<~SQL.squish
        UPDATE chat_messages
        SET message_type = CASE UPPER(COALESCE(type, 'TEXT'))
          WHEN 'TEXT' THEN 0
          WHEN 'SYSTEM' THEN 1
          WHEN 'CODE' THEN 2
          WHEN 'FILE' THEN 3
          ELSE 0
        END
      SQL
      remove_column :chat_messages, :type
    end
  end

  def align_questions
    unless column_exists?(:questions, :category)
      add_column :questions, :category, :integer, default: 0, null: false
    end
    unless column_exists?(:questions, :starter_code)
      add_column :questions, :starter_code, :jsonb, default: {}
    end
    unless column_exists?(:questions, :solution)
      add_column :questions, :solution, :text
    end
    unless column_exists?(:questions, :time_limit_minutes)
      add_column :questions, :time_limit_minutes, :integer
    end
    unless column_exists?(:questions, :tags)
      add_column :questions, :tags, :text, array: true, default: []
    end

    add_index :questions, :category unless index_exists?(:questions, :category)
    add_index :questions, :difficulty unless index_exists?(:questions, :difficulty)
  end

  def align_session_files
    unless column_exists?(:session_files, :filename)
      add_column :session_files, :filename, :string
    end
    unless column_exists?(:session_files, :last_modified_by_id)
      add_column :session_files, :last_modified_by_id, :string
    end

    # Convert integer language codes to string names when needed.
    if column_exists?(:session_files, :language)
      type = connection.columns(:session_files).find { |c| c.name == "language" }&.sql_type
      if type&.include?("int")
        add_column :session_files, :language_name, :string
        LANGUAGE_NAMES.each do |code, name|
          execute "UPDATE session_files SET language_name = #{connection.quote(name)} WHERE language = #{code}"
        end
        execute "UPDATE session_files SET language_name = 'plaintext' WHERE language_name IS NULL"
        remove_column :session_files, :language
        rename_column :session_files, :language_name, :language
        change_column_null :session_files, :language, false
      end
    else
      add_column :session_files, :language, :string, null: false, default: "javascript"
    end

    # Backfill path/filename for any incomplete rows.
    execute <<~SQL.squish
      UPDATE session_files
      SET path = '/' || COALESCE(filename, 'untitled')
      WHERE path IS NULL OR path = ''
    SQL
    execute <<~SQL.squish
      UPDATE session_files
      SET filename = TRIM(BOTH '/' FROM path)
      WHERE filename IS NULL OR filename = ''
    SQL
  end

  def align_session_participants
    unless column_exists?(:session_participants, :last_seen_at)
      add_column :session_participants, :last_seen_at, :datetime
    end

    role_col = connection.columns(:session_participants).find { |c| c.name == "role" }
    return unless role_col
    return if role_col.type == :integer

    add_column :session_participants, :role_int, :integer, default: 0, null: false
    execute <<~SQL.squish
      UPDATE session_participants
      SET role_int = CASE LOWER(COALESCE(role::text, 'participant'))
        WHEN '0' THEN 0
        WHEN '1' THEN 1
        WHEN '2' THEN 2
        WHEN '3' THEN 3
        WHEN 'participant' THEN 0
        WHEN 'owner' THEN 1
        WHEN 'interviewer' THEN 2
        WHEN 'candidate' THEN 3
        WHEN 'PARTICIPANT' THEN 0
        WHEN 'OWNER' THEN 1
        ELSE 0
      END
    SQL
    remove_column :session_participants, :role
    rename_column :session_participants, :role_int, :role
  end
end
