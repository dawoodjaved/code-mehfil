class AddTagsToSessions < ActiveRecord::Migration[7.2]
  def change
    add_column :sessions, :tags, :string, array: true, default: []
    add_index :sessions, :tags, using: "gin"
  end
end

