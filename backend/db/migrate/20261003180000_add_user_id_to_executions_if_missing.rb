# frozen_string_literal: true

class AddUserIdToExecutionsIfMissing < ActiveRecord::Migration[7.2]
  def change
    return unless table_exists?(:executions)

    unless column_exists?(:executions, :user_id)
      add_column :executions, :user_id, :string
    end

    add_index :executions, :user_id,
              name: "idx_executions_user",
              if_not_exists: true

    if column_exists?(:executions, :created_at)
      add_index :executions, [:user_id, :created_at],
                name: "idx_executions_user_created",
                if_not_exists: true
    end
  end
end
