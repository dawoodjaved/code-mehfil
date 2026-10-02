class RenameSessionsTypeToSessionType < ActiveRecord::Migration[7.2]
  def up
    if column_exists?(:sessions, :type) && !column_exists?(:sessions, :session_type)
      rename_column :sessions, :type, :session_type
    elsif !column_exists?(:sessions, :session_type)
      add_column :sessions, :session_type, :integer, default: 0
    end
  end

  def down
    if column_exists?(:sessions, :session_type) && !column_exists?(:sessions, :type)
      rename_column :sessions, :session_type, :type
    end
  end
end
