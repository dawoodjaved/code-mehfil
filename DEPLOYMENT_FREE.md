# CodeMehfil — deployment (Railway + Vercel)

Last updated: October 2026. Always confirm signup pages yourself — providers change terms.

---

## Recommended stack

| Layer | Service | Role |
|-------|---------|------|
| **Frontend** | [Vercel](https://vercel.com) Hobby | Next.js UI |
| **API** | [Railway](https://railway.app) | Rails API + ActionCable |
| **Postgres** | Railway Postgres **or** [Neon](https://neon.tech) | Users, sessions, questions |
| **Redis** | Railway Redis **or** [Upstash](https://upstash.com) | Realtime (ActionCable) |
| **Video (optional)** | [LiveKit Cloud](https://livekit.io) Build | Multi-user video |
| **Code run (optional)** | Judge0 on RapidAPI | Remote execution; without it, API uses local fallback |

### Why split hosts?

- **Vercel** is ideal for Next.js; not ideal for long-lived Rails + WebSockets + subprocess execution.
- **Railway** runs the Rails API, Postgres, and Redis in one project.

> **Card note:** Railway typically requires a payment method for new accounts (usage / trial credits). Vercel Hobby, Neon free, Upstash free, and LiveKit Build generally do not require a card for basic use.

---

## Is LiveKit free?

**Yes, for small use.** [LiveKit Cloud Build](https://livekit.com/pricing) is **$0/month** (limits apply). Without LiveKit, video falls back to local camera preview only.

---

## Provider details

### 1. Vercel — frontend

- Root directory: `frontend`
- Env:
  - `NEXT_PUBLIC_API_URL` = `https://….up.railway.app`
  - `NEXT_PUBLIC_CABLE_URL` = `wss://….up.railway.app/cable`
  - `NEXT_PUBLIC_APP_URL` = your Vercel URL
  - `NEXT_PUBLIC_LIVEKIT_URL` = optional

### 2. Railway — API (+ Postgres + Redis)

- Deploy from GitHub; **Root Directory** = `backend`
- Uses `backend/railway.toml` (Nixpacks, `rails db:migrate`, Puma, health `/api/health`)
- Add **PostgreSQL** and **Redis** in the same project
- Env (minimum):
  - `DATABASE_URL` → reference Railway Postgres (or Neon URL)
  - `REDIS_URL` → reference Railway Redis (or Upstash URL)
  - `JWT_SECRET` → long random string
  - `CORS_ORIGINS` → your Vercel URL(s), comma-separated
  - `RAILS_ENV=production`
- Generate a **public domain** on the API service
- Optional: LiveKit + Judge0 vars

See full steps in [DEPLOYMENT.md](./DEPLOYMENT.md).

### 3. Neon — Postgres (optional instead of Railway Postgres)

- Free tier, no card for basic use
- Copy connection string → `DATABASE_URL` on Railway API

### 4. Upstash — Redis (optional instead of Railway Redis)

- Free tier for light usage
- Copy `REDIS_URL` → Railway API

### 5. Judge0 — optional

- If `JUDGE0_API_KEY` is empty, Rails runs languages on the API container (OK for demos, not hard sandboxing)

---

## What works vs limited

| Feature | Behavior |
|---------|----------|
| Sign up / login | Needs Postgres + `JWT_SECRET` |
| Sessions, interview UI | ✅ |
| Realtime collab | Needs Redis + `wss://…/cable` |
| Video (multi-user) | With LiveKit; else solo preview |
| Run code | Fallback on API; optional Judge0 |
| Always free / no card | ❌ Railway usually needs a card |

---

## Step-by-step (minimal path)

1. **GitHub** — push this repo  
2. **Railway** — new project from repo, root `backend`, add Postgres + Redis, set env vars, generate domain  
3. **Vercel** — import repo, root `frontend`, set `NEXT_PUBLIC_*` to Railway URLs  
4. **Railway** — set `CORS_ORIGINS` to the exact Vercel URL  
5. Optional: LiveKit + Judge0  
6. Smoke test: register → session → second browser join → edit → run → video  

---

## Env cheat sheet

**Vercel only:**  
`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CABLE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_LIVEKIT_URL`

**Railway API only:**  
`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `RAILS_ENV=production`, optional LiveKit + Judge0

---

## What to send when you’re ready to deploy

1. Vercel URL  
2. Railway API URL  
3. Confirm Postgres + Redis (Railway or Neon/Upstash)  
4. Generated `JWT_SECRET` (32+ chars)  
5. (Optional) LiveKit URL + key + secret  
6. (Optional) Judge0 RapidAPI key  
