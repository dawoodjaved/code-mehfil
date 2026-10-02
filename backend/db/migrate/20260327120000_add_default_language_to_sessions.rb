class AddDefaultLanguageToSessions < ActiveRecord::Migration[7.2]
  def change
    unless column_exists?(:sessions, :default_language)
      add_column :sessions, :default_language, :string, default: "javascript"
    end
  end
end
