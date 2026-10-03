# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_10_03_170000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "chat_messages", id: :string, force: :cascade do |t|
    t.string "session_id", null: false
    t.string "user_id", null: false
    t.text "content", null: false
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.integer "message_type", default: 0, null: false
    t.index ["session_id"], name: "idx_chat_messages_session"
    t.index ["session_id", "created_at"], name: "idx_chat_messages_session_created"
    t.index ["user_id"], name: "idx_chat_messages_user"
  end

  create_table "executions", id: :string, force: :cascade do |t|
    t.string "session_id", null: false
    t.string "file_id"
    t.string "user_id", null: false
    t.integer "language", null: false
    t.text "code", null: false
    t.text "input"
    t.integer "status", default: 0
    t.text "output"
    t.text "error"
    t.integer "exit_code"
    t.integer "execution_time"
    t.integer "memory_used"
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.datetime "completed_at", precision: nil
    t.index ["session_id"], name: "idx_executions_session"
    t.index ["status"], name: "idx_executions_status"
    t.index ["user_id"], name: "idx_executions_user"
    t.index ["user_id", "created_at"], name: "idx_executions_user_created"
  end

  create_table "questions", id: :string, force: :cascade do |t|
    t.string "title", null: false
    t.text "description", null: false
    t.integer "difficulty", null: false
    t.text "topics", default: [], array: true
    t.string "workspace_id"
    t.string "created_by_id", null: false
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "category", default: 0, null: false
    t.jsonb "starter_code", default: {}
    t.text "solution"
    t.integer "time_limit_minutes"
    t.text "tags", default: [], array: true
    t.string "source", default: "internal", null: false
    t.string "external_id"
    t.string "external_url"
    t.jsonb "source_metadata", default: {}
    t.index ["category"], name: "index_questions_on_category"
    t.index ["created_by_id"], name: "idx_questions_created_by"
    t.index ["difficulty"], name: "index_questions_on_difficulty"
    t.index ["source", "external_id"], name: "index_questions_on_source_and_external_id", unique: true, where: "(external_id IS NOT NULL)"
    t.index ["source"], name: "index_questions_on_source"
    t.index ["starter_code"], name: "idx_questions_starter_code_gin", using: :gin
  end

  create_table "session_files", id: :string, force: :cascade do |t|
    t.string "session_id", null: false
    t.string "path", null: false
    t.string "filename"
    t.text "content"
    t.string "created_by_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.string "last_modified_by_id"
    t.string "language", null: false
    t.index ["session_id"], name: "idx_session_files_session"
    t.unique_constraint ["session_id", "path"], name: "session_files_session_id_path_key"
  end

  create_table "session_participants", id: :string, force: :cascade do |t|
    t.string "session_id", null: false
    t.string "user_id", null: false
    t.datetime "joined_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.datetime "left_at", precision: nil
    t.boolean "video_enabled", default: false
    t.boolean "audio_enabled", default: false
    t.boolean "screen_sharing", default: false
    t.boolean "is_candidate", default: false
    t.text "interviewer_notes"
    t.jsonb "rubric_scores"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.jsonb "cursor_position"
    t.datetime "last_seen_at"
    t.integer "role", default: 0, null: false
    t.index ["session_id"], name: "idx_session_participants_session"
    t.index ["session_id", "user_id"], name: "idx_session_participants_session_user", unique: true
    t.index ["user_id"], name: "idx_session_participants_user"
  end

  create_table "session_questions", id: :string, force: :cascade do |t|
    t.string "session_id", null: false
    t.string "question_id", null: false
    t.datetime "assigned_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.datetime "completed_at", precision: nil
    t.index ["session_id"], name: "idx_session_questions_session"
    t.unique_constraint ["session_id", "question_id"], name: "session_questions_session_id_question_id_key"
  end

  create_table "sessions", id: :string, force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.integer "session_type", default: 0
    t.integer "status", default: 0
    t.string "workspace_id"
    t.string "created_by_id", null: false
    t.datetime "started_at", precision: nil
    t.datetime "ended_at", precision: nil
    t.string "interview_link"
    t.string "interview_password"
    t.datetime "interview_expires_at", precision: nil
    t.integer "timer_seconds"
    t.integer "time_extension"
    t.integer "time_limit_minutes"
    t.string "recording_url"
    t.datetime "recording_started_at", precision: nil
    t.string "code"
    t.text "tags", default: [], array: true
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.string "default_language", default: "javascript"
    t.index ["code"], name: "idx_sessions_code"
    t.index ["created_at"], name: "idx_sessions_created_at"
    t.index ["created_by_id"], name: "idx_sessions_created_by"
    t.index ["status"], name: "idx_sessions_status"
    t.unique_constraint ["code"], name: "sessions_code_key"
  end

  create_table "test_cases", id: :string, force: :cascade do |t|
    t.string "question_id", null: false
    t.text "input", null: false
    t.text "expected_output", null: false
    t.boolean "is_public", default: true
    t.integer "order", default: 0
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.index ["question_id"], name: "idx_test_cases_question"
  end

  create_table "users", id: :string, force: :cascade do |t|
    t.string "email", null: false
    t.string "name"
    t.string "avatar"
    t.datetime "email_verified", precision: nil
    t.string "password_digest"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.datetime "last_seen_at", precision: nil

    t.unique_constraint ["email"], name: "users_email_key"
  end
end
