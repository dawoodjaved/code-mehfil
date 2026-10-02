class AddLastSeenAtToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :last_seen_at, :datetime unless column_exists?(:users, :last_seen_at)
  end
end
