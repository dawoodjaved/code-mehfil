# CodeMehfil – Deploy to Railway + Vercel

Step-by-step guide to deploy CodeMehfil using **Railway** (backend + Postgres + Redis) and **Vercel** (frontend).

> **Note:** Railway usually asks for a credit card for new accounts (trial credits apply). You are billed for usage after credits, not a flat “always free” plan like some hosts.

---

## Prerequisites

- [GitHub](https://github.com) account
- [Railway](https://railway.app) account
- [Vercel](https://vercel.com) account (Hobby is free)
- Code pushed to a GitHub repository

---

## Part 1: Deploy Backend to Railway

### Step 1: Create a Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project**
3. Choose **Deploy from GitHub repo** and select this repository

### Step 2: Configure the API service

1. Open the service that was created from the repo
2. **Settings → Root Directory** → set to `backend`
3. Railway will pick up `backend/railway.toml` (Nixpacks, migrate, Puma, `/api/health`)
4. Under **Settings → Networking → Public Networking**, click **Generate Domain**  
   You’ll get something like: `https://codemehfil-api-production.up.railway.app`

### Step 3: Add Postgres and Redis

1. In the project canvas, click **+ New** → **Database** → **PostgreSQL**
2. Click **+ New** → **Database** → **Redis**

### Step 4: Environment variables (API service)

In the API service → **Variables**, add:

| Variable | Value |
|----------|--------|
| `RAILS_ENV` | `production` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (use Railway’s variable reference UI) |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` (or Redis’s public/private URL reference) |
| `JWT_SECRET` | long random string (32+ chars) |
| `CORS_ORIGINS` | placeholder for now, e.g. `https://placeholder.vercel.app` |

**Optional:**

| Variable | Value |
|----------|--------|
| `JUDGE0_API_KEY` | RapidAPI Judge0 key |
| `JUDGE0_API_URL` | `https://judge0-ce.p.rapidapi.com` |
| `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` / `LIVEKIT_URL` | LiveKit Cloud |

> If your Postgres/Redis service names differ, pick them from Railway’s **Variable Reference** picker instead of typing `${{Postgres.DATABASE_URL}}` by hand.

### Step 5: Deploy and verify

1. Trigger a deploy (push or **Deploy**)
2. Open `https://YOUR-RAILWAY-DOMAIN/api/health` — you should get a health JSON response
3. Optional seed (Railway → API service → shell / one-off command):
   ```bash
   bundle exec rails db:seed
   ```

### Step 6: Update CORS after frontend deploy

1. API service → **Variables**
2. Set `CORS_ORIGINS` to your Vercel URL(s), comma-separated, e.g.:
   ```
   https://codemehfil.vercel.app,https://codemehfil-xxx-yourteam.vercel.app
   ```
3. Redeploy the API if needed

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. **Add New** → **Project** → import the same GitHub repo
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Install Command**: `pnpm install` (or `npm install`)
   - **Build Command**: `pnpm build` (or default)

### Step 2: Environment Variables

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-RAILWAY-DOMAIN` (no trailing slash) |
| `NEXT_PUBLIC_CABLE_URL` | `wss://YOUR-RAILWAY-DOMAIN/cable` |
| `NEXT_PUBLIC_APP_URL` | `https://code-mehfil-sigma.vercel.app` (your real Vercel URL, no trailing slash) |
| `NEXT_PUBLIC_LIVEKIT_URL` | optional (`wss://….livekit.cloud`) |

### Step 3: Deploy

1. Click **Deploy**
2. App URL: `https://your-project.vercel.app`

---

## Part 3: Final Setup

1. Set Railway `CORS_ORIGINS` to the real Vercel URL
2. Smoke test: sign up → create session → join with code → edit code → run code → video (if LiveKit set)

---

## Railway notes

- Trial / usage credits; card is often required at signup
- Postgres + Redis live in the same project (private networking)
- Public API URL is under **Networking → Generate Domain**
- Logs: service → **Deployments** / **Logs**

---

## Vercel Free Tier Notes

- Hobby: free for personal / non-commercial fair use
- Automatic HTTPS and preview deploys per PR

---

## Troubleshooting

### CORS errors

- `CORS_ORIGINS` must include the exact Vercel origin (`https://…`, no trailing slash)
- Redeploy API after changing env vars

### WebSocket (ActionCable) not connecting

- Set `NEXT_PUBLIC_CABLE_URL` to `wss://YOUR-RAILWAY-DOMAIN/cable`
- Confirm Redis is linked via `REDIS_URL`

### 401 Unauthorized

- Sign in first; JWT is stored in `localStorage`
- Confirm `JWT_SECRET` is set on Railway

### Backend 500 / migrate failures

- Check Railway deploy logs
- Confirm `DATABASE_URL` references Postgres correctly
- Run `bundle exec rails db:migrate` from a one-off shell if needed

---

## Quick Reference

| Service | URL |
|---------|-----|
| Backend (Railway) | `https://YOUR-SERVICE.up.railway.app` |
| Frontend (Vercel) | `https://your-project.vercel.app` |
| API Health | `https://YOUR-SERVICE.up.railway.app/api/health` |
| WebSocket | `wss://YOUR-SERVICE.up.railway.app/cable` |

Config in repo: `backend/railway.toml` (API build/start/health/migrate).
