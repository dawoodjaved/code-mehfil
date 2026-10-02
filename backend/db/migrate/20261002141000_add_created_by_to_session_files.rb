class AddCreatedByToSessionFiles < ActiveRecord::Migration[7.2]
  def change
    unless column_exists?(:session_files, :created_by_id)
      add_column :session_files, :created_by_id, :string
    end
  end
end
