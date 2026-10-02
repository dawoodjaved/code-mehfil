# CodeMehfil

A real-time collaborative coding workspace for pair programming and technical interviews — shared editor, live chat, code execution, video, and whiteboard in one place.

Built so you don’t have to bounce between Zoom, a pastebin, and a separate IDE during a session.

---

## Features

**Collaborative editor**  
Monaco (same engine as VS Code). Multiple people edit the same file at once with live sync over ActionCable. Cursor and selection updates are broadcast so you can see where others are working.

**Code execution**  
Run code from the session UI or the in-app terminal (`run`). Supports JavaScript, TypeScript, Python, Java, C++, C, Go, Rust, Ruby, PHP, and Swift. Uses Judge0 when configured; otherwise the API falls back to local runtimes on the server.

**Sessions**  
Create collaboration, interview, or practice sessions. Share a link, invite by email, or join with an 8-character session code. Session list shows everything you’re part of.

**Interview mode**  
Timer, question bank (algorithms, data structures, system design, and more), HackerRank-style / Codeforces problem helpers, and run-against-test-cases flow for assessing solutions.

**Chat**  
In-session messaging with history and typing indicators over the same realtime channel as the editor.

**Video**  
LiveKit-backed multi-user video when keys are set; otherwise a local camera preview still works for solo checks.

**Whiteboard**  
Excalidraw for diagrams and system-design sketches during a session.

**Terminal**  
Lightweight in-session terminal: `help`, `clear`, `ls`, `pwd`, `echo`, and `run` (executes the current editor code).

**Auth**  
Email/password signup and login with JWT. Session and channel access require participation.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind, Monaco, Zustand |
| Backend | Rails 7.2 API, PostgreSQL, Redis, ActionCable, JWT |
| Execution | Judge0 (optional) or local Open3 fallbacks |
| Video | LiveKit (optional) |
| Whiteboard | Excalidraw |
| Deploy | **Vercel** (frontend) + **Railway** (API, Postgres, Redis) |

---

## Local setup

### Requirements

- Node.js 18+
- Ruby 3.1+ (3.1.4+ recommended)
- Docker & Docker Compose (Postgres + Redis)
- pnpm or npm

### 1. Clone and install

```bash
git clone https://github.com/dawoodjaved/CodePair.git
cd CodePair

cd frontend && pnpm install && cd ..
cd backend && bundle install && cd ..
```

### 2. Environment

```bash
cp .env.example .env.local
# Fill JWT_SECRET and any optional LiveKit / Judge0 keys
# Symlink or copy into frontend/.env.local and backend/.env as needed
```

Never commit `.env`, `.env.local`, or real API keys. Only `.env.example` (placeholders) belongs in git.

### 3. Databases

```bash
docker compose up -d
cd backend
bundle exec rails db:create db:migrate db:seed
```

### 4. Run

```bash
# Terminal 1 — API (default often PORT from .env, e.g. 4004)
cd backend && bundle exec rails server

# Terminal 2 — UI
cd frontend && pnpm dev
```

Open the frontend URL printed by Next.js (commonly `http://localhost:3005` or `3000`). Sign up, create a session, and share the join code with a second browser.

---

## How to use

1. **Create a session** — title, type (collaboration / interview / practice), optional time limit and default language.  
2. **Share** — copy link, session code, or invite by email. Guests join via `/join` with the code (must be signed in).  
3. **Code together** — pick a language in the dropdown, edit, click **Run Code** or type `run` in the terminal.  
4. **Interview** — open the Interview tab for timer, questions, and test runs.  
5. **Video / whiteboard / chat** — use the matching tabs and sidebar during the session.

---

## Project layout

```
├── frontend/          # Next.js app (Vercel)
├── backend/           # Rails API (Railway) + railway.toml
├── scripts/           # Optional local import helpers (no catalog dumps in git)
├── data/              # Local-only import artifacts (gitignored)
├── docker-compose.yml
├── .env.example
├── DEPLOYMENT.md      # Railway + Vercel production guide
└── README.md
```

HackerRank CSV/JSON catalogs and other large dumps are **gitignored**. Import them locally if you maintain a private question bank; do not push them to GitHub.

---

## API (high level)

All routes live under `/api`. Highlights:

- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- Sessions: CRUD, `POST /sessions/join`, participants, files, chat, executions
- Questions & test cases for interview flows
- `POST /livekit/token` when LiveKit is configured
- Health: `GET /api/health`

See `backend/config/routes.rb` for the full list.

---

## Deployment

Production target: **frontend on Vercel**, **API + Postgres + Redis on Railway**.

Full steps, env vars, and CORS setup: **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

Before connecting Railway, push this repo to GitHub so the service can build from `backend/` (see `backend/railway.toml`).

---

## Troubleshooting

**Ports in use** — free the frontend/API ports or change `PORT` / Next config.  
**DB errors** — `docker compose ps` and ensure Postgres is healthy, then remigrate.  
**WebSockets** — set `NEXT_PUBLIC_CABLE_URL` to `ws://…/cable` locally or `wss://…/cable` in production.  
**Python run as Node error** — confirm the language dropdown is Python and the API received `language: "python"`.  
**CORS in production** — Railway `CORS_ORIGINS` must include your exact Vercel origin.

---

## License

Portfolio / proprietary project. Feel free to use it as inspiration for your own work.
