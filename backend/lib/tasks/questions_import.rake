# frozen_string_literal: true

namespace :questions do
  desc "Import cleaned HackerRank challenges from data/hackerrank_challenges.clean.json"
  task import_hackerrank: :environment do
    path = ENV.fetch(
      "HACKERRANK_JSON",
      Rails.root.join("..", "data", "hackerrank_challenges.clean.json").expand_path.to_s
    )
    path = Rails.root.join("..", path).expand_path.to_s unless Pathname.new(path).absolute?

    unless File.exist?(path)
      abort "Missing clean JSON at #{path}. Place a cleaned challenges JSON at data/hackerrank_challenges.clean.json (or set HACKERRANK_JSON)."
    end

    payload = JSON.parse(File.read(path))
    challenges = payload["challenges"] || []
    user = User.order(:created_at).first || User.create!(
      name: "System",
      email: "system@localhost.local",
      password: SecureRandom.hex(16)
    )

    created = 0
    updated = 0
    skipped = 0

    challenges.each do |row|
      attrs = {
        title: row["title"],
        description: row["description"],
        difficulty: row["difficulty"],
        category: row["category"],
        topics: Array(row["topics"]),
        tags: Array(row["tags"]),
        starter_code: row["starter_code"] || {},
        time_limit_minutes: row["time_limit_minutes"],
        source: row["source"].presence || "hackerrank",
        external_id: row["external_id"],
        external_url: row["external_url"],
        source_metadata: row["source_metadata"] || {}
      }

      existing = Question.find_by(source: attrs[:source], external_id: attrs[:external_id])
      if existing
        existing.update!(attrs)
        updated += 1
      else
        Question.create!(attrs.merge(created_by: user))
        created += 1
      end
    rescue StandardError => e
      skipped += 1
      Rails.logger.warn("Skip #{row['external_id']}: #{e.message}")
    end

    puts "HackerRank import done: created=#{created} updated=#{updated} skipped=#{skipped} total=#{challenges.size}"
  end

  desc "Import questions from a JSON file (generic pipeline). HACKERRANK_JSON or IMPORT_JSON=path"
  task import_json: :environment do
    path = ENV["IMPORT_JSON"].presence || ENV["HACKERRANK_JSON"].presence
    abort "Set IMPORT_JSON=/path/to/file.json" unless path
    ENV["HACKERRANK_JSON"] = path
    Rake::Task["questions:import_hackerrank"].invoke
  end
end
