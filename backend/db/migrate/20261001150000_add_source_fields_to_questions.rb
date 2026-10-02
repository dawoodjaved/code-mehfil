class AddSourceFieldsToQuestions < ActiveRecord::Migration[7.2]
  def change
    add_column :questions, :source, :string, default: "internal", null: false unless column_exists?(:questions, :source)
    add_column :questions, :external_id, :string unless column_exists?(:questions, :external_id)
    add_column :questions, :external_url, :string unless column_exists?(:questions, :external_url)
    add_column :questions, :source_metadata, :jsonb, default: {} unless column_exists?(:questions, :source_metadata)

    add_index :questions, :source unless index_exists?(:questions, :source)
    add_index :questions, [:source, :external_id], unique: true, where: "external_id IS NOT NULL", name: "index_questions_on_source_and_external_id" unless index_exists?(:questions, [:source, :external_id], name: "index_questions_on_source_and_external_id")
  end
end
