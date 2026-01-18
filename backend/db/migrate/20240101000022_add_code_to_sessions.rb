class AddCodeToSessions < ActiveRecord::Migration[7.2]
  def change
    unless column_exists?(:sessions, :code)
      add_column :sessions, :code, :string
    end
    unless index_exists?(:sessions, :code)
      add_index :sessions, :code, unique: true
    end
  end
end
