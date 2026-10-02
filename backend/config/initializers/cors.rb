Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*(
      ENV.fetch(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3003,http://localhost:3005,http://localhost:3006,http://localhost:3400"
      ).split(",").map(&:strip) + [/http:\/\/localhost:\d+/]
    ))

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ["Authorization"]
  end
end
