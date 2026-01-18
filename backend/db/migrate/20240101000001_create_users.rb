class CreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users, id: :string do |t|
      t.string :email, null: false, index: { unique: true }
      t.string :name
      t.string :avatar
      t.datetime :email_verified
      t.string :password_digest
      t.timestamps
    end
  end
end

