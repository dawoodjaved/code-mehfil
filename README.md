# CodeMehfil

Real-time collaborative coding for pair programming and technical interviews.

## Features

- Shared Monaco editor with live sync
- Code execution (JS, Python, Java, C++, and more)
- Collaboration, interview, and practice sessions
- Join by link or session code
- Interview mode with timer, questions, and test cases
- In-session chat
- Video (LiveKit) and whiteboard (Excalidraw)
- Lightweight terminal (`run`, `help`, `clear`, …)
- Email/password auth with JWT

## Technologies

| Layer | Stack |
|-------|--------|
| Frontend | Next.js, React, TypeScript, Tailwind, Monaco, Zustand |
| Backend | Rails API, PostgreSQL, Redis, ActionCable, JWT |
| Execution | Judge0 (optional) or local runtimes |
| Video | LiveKit (optional) |
| Whiteboard | Excalidraw |

## How to start

**Requirements:** Node.js 18+, Ruby 3.1+, Docker, pnpm or npm

```bash
# Install
cd frontend && pnpm install && cd ..
cd backend && bundle install && cd ..

# Environment
cp .env.example .env.local
# Set JWT_SECRET (and optional LiveKit / Judge0 keys)

# Database
docker compose up -d
cd backend && bundle exec rails db:create db:migrate db:seed && cd ..

# Run (two terminals)
cd backend && bundle exec rails server
cd frontend && pnpm dev
```

Open the URL shown by Next.js (usually `http://localhost:3000` or `3005`), sign up, and create a session.
