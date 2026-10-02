class AddTimeLimitMinutesToSessions < ActiveRecord::Migration[7.2]
  def change
    unless column_exists?(:sessions, :time_limit_minutes)
      add_column :sessions, :time_limit_minutes, :integer
    end
  end
end
