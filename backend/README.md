# CodePair Rails API

Rails API backend for CodePair platform.

## Setup

1. Install dependencies:
```bash
bundle install
```

2. Setup database:
```bash
rails db:create
rails db:migrate
rails db:seed
```

3. Start server:
```bash
rails server
```

## API Endpoints

All endpoints are under `/api` prefix.

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

See `config/routes.rb` for full route list.

## Background Jobs

Uses Sidekiq for background job processing:
```bash
bundle exec sidekiq
```

## ActionCable

WebSocket connections available at `/cable`.

## Environment Variables

See `.env.example` for required environment variables.

