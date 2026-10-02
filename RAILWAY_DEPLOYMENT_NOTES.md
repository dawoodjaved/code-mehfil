# Railway deployment — what we hit (post-mortem)

This document is a honest record of issues encountered while deploying **CodeMehfil** to **Railway** (API) + **Vercel** (frontend), after you set up the project and asked to deploy, seed the database, and wire the CLI.

It is **not** a step-by-step tutorial — use [DEPLOYMENT.md](./DEPLOYMENT.md) for that. This is the “what broke and why” log.

---

## Timeline (short)

1. Docs originally pointed at **Render + Vercel**; Render asked for a card, so we switched specs to **Railway + Vercel**.
2. You pushed code to GitHub and configured Railway (Postgres, Redis, env vars).
3. **`railway login`** had to be done in your browser; the agent could not complete OAuth alone.
4. First deploys **failed** repeatedly (wrong builder, wrong Ruby version, missing secrets, migration/schema drift, seed errors).
5. After fixes, API went **live**: `https://code-mehfil-api-production.up.railway.app`
6. **`db:seed`** succeeded once via a bootstrap start script; we then switched to a **safe** start command so restarts do not wipe the DB.
7. Login returned **500** until `last_seen_at` existed on `users`.

---

## Infrastructure / account issues

### Render wanted a card

You did not want to enter card details on Render. Railway was chosen instead. Note: **Railway also often requires a payment method** for new accounts (trial credits), which is different from “always free, no card.”

### Two “Postgres” services in one Railway project

The project **cooperative-growth** ended up with multiple database services (e.g. `Postgres`, `Postgres-qePw`). That is easy to do when clicking “New Postgres” more than once. The API must reference **one** `DATABASE_URL` consistently (via `${{Postgres.DATABASE_URL}}` or the service you actually use).

### GitHub repo rename

Git remote noted a move toward `code-mehfil`; old `CodePair` remote still worked for push. Worth updating `origin` when convenient.

---

## Railway CLI and linking

| Issue | What happened |
|--------|----------------|
| **Not logged in** | `railway whoami` → `Unauthorized` until you ran `railway login` locally. |
| **No linked project** | `railway link` needed for project **cooperative-growth**, environment **production**, service **code-mehfil-api**. |
| **Service `code-mehfil` missing in production** | GraphQL listed `code-mehfil` on the project, but **production** only had DB services attached at first. We created **`code-mehfil-api`** as a new empty service and deployed into it. |
| **SSH seed blocked** | `railway ssh` failed with **Host key verification failed** until SSH keys were registered; even then, seed via SSH was unreliable. We used **start/bootstrap scripts** instead. |

---

## Build and deploy failures

### 1. Wrong stack detected (Node / pnpm instead of Rails)

**Symptom:** Build log: “Detected Node”, “Failed to resolve version 8.15.0 of pnpm”.

**Cause:** `railway up` from the **repo root** uploaded the monorepo; Railpack tried to build the **frontend/workspace**, not Rails.

**Fix:**

- Set service **root directory** to `backend` (via Railway dashboard or GraphQL `serviceInstanceUpdate`).
- Added **`.railwayignore`** to exclude `frontend/`, `node_modules/`, large data files from uploads when deploying from root.
- Switched to **Dockerfile** build under `backend/` (`ruby:3.1.4-slim`, `bundle install`, Puma).

### 2. Ruby version mismatch

**Symptom:** `Your Ruby version is 3.2.2, but your Gemfile specified 3.1.4`.

**Fix:** Dockerfile base image **`ruby:3.1.4-slim`** to match `Gemfile`.

### 3. Missing `SECRET_KEY_BASE`

**Symptom:** Pre-deploy / migrate: `Missing secret_key_base for 'production' environment`.

**Fix:** Set **`SECRET_KEY_BASE`** (and **`JWT_SECRET`**) on the API service in Railway Variables.

### 4. Puma crash — `tmp/pids/server.pid`

**Symptom:** `No such file or directory @ rb_sysopen - tmp/pids/server.pid`.

**Fix:** Dockerfile: `RUN mkdir -p tmp/pids tmp/cache log storage`.

### 5. Upload / snapshot size

**Symptom:** Occasional **500** on upload when sending whole repo; **pnpm** / `node_modules` paths caused noise.

**Fix:** `.railwayignore` + deploy with **`rootDirectory: backend`** or upload from `backend/` when using CLI.

---

## Database and migrations

### Foreign key to non-existent `workspaces` table

**Symptom:** Migrate failed: `relation "workspaces" does not exist` on `create_sessions` migration.

**Fix:** Removed `add_foreign_key` to `workspaces` in early migrations; app uses optional `workspace_id` without that table.

### `session_type` vs legacy `type` column

**Symptom:** Seed failed: `Undeclared attribute type for enum 'session_type' in Session`.

**Cause:** Old migration created column **`type`**; Rails model expects **`session_type`**.

**Fix:** Migration `rename_sessions_type_to_session_type`; updated `create_sessions` migration for fresh installs.

### Pre-deploy migrate vs empty DB after DROP SCHEMA

**Symptom:** Seed or start complained about **pending migrations** or empty `schema_migrations` after reset.

**Cause:** Mix of `db:schema:load` (schema version behind newest migration file), `preDeployCommand` not always running as expected, and one-off **DROP SCHEMA** resets.

**Fix:** Bootstrap script: `DROP SCHEMA …` → **`db:migrate`** (full chain) → **`db:seed`**. Normal runtime: **`db:migrate` only** via `bin/railway-start`.

### Missing columns vs `schema.rb` / seeds

Production DB was built from **migrations**, not always an up-to-date **`schema.rb`**. Seeds and models assumed columns that migrations had not added yet:

| Missing column | Symptom | Migration added |
|----------------|---------|-----------------|
| `sessions.time_limit_minutes` | `unknown attribute 'time_limit_minutes' for Session` | `20261002140000_add_time_limit_minutes_to_sessions` |
| `session_files.created_by_id` | `can't write unknown attribute created_by_id` | `20261002141000_add_created_by_to_session_files` |
| `users.last_seen_at` | Login **500** in `update_last_seen!` | `20261002142000_add_last_seen_at_to_users` |

**Lesson:** After changing models/seeds locally, run **`rails db:migrate`** and commit migrations before redeploying; or regenerate **`schema.rb`** and keep migration version in sync.

---

## Seeding (`bundle exec rails db:seed`)

### Could not run from agent machine initially

- Local seed failed: **Postgres role `postgres` does not exist** — macOS had **Homebrew Postgres on 5432**, not Docker.
- Docker Desktop was off; then we mapped Docker Postgres to **5433** to avoid port clash.

### Production seed strategy

- **Dashboard shell** / **`railway run`** need linked project + correct service.
- We used **`bin/railway-bootstrap`**: wipe public schema → migrate → seed → Puma.
- **Important:** Leaving bootstrap as the permanent **startCommand** would **wipe data on every restart**. Switched to **`bin/railway-start`**: `db:migrate` + Puma only.

### Seed users (after successful seed)

- `john@example.com` / `password123`
- `jane@example.com` / `password123`
- `bob@example.com` / `password123`

---

## Runtime / API behavior

### Root URL returns 404

`GET https://code-mehfil-api-production.up.railway.app/` → **404** (empty body). Expected: no HTML app at `/`.

Use **`/api/health`**, **`/api/auth/login`**, etc.

### Login 500 after seed

Credentials were valid, but **`update_last_seen!`** wrote to **`last_seen_at`** before the column existed. Fixed with migration + defensive check in `User#update_last_seen!`.

### CORS still placeholder until Vercel exists

`CORS_ORIGINS` was set to a placeholder until the real Vercel URL is known. Update after frontend deploy or browser calls will fail.

---

## Env vars checklist (API service)

| Variable | Notes |
|----------|--------|
| `RAILS_ENV` | `production` |
| `DATABASE_URL` | Reference Railway Postgres |
| `REDIS_URL` | Reference Railway Redis |
| `JWT_SECRET` | Long random string |
| `SECRET_KEY_BASE` | Required for Rails production |
| `CORS_ORIGINS` | Exact Vercel origin(s), comma-separated |
| `WEB_CONCURRENCY` | Set to `1` to reduce memory (optional) |

Optional: Judge0, LiveKit — see `.env.example`.

---

## Files added or changed for Railway (reference)

| Path | Purpose |
|------|---------|
| `backend/railway.toml` | Dockerfile build, health check, migrate hints |
| `backend/Dockerfile` | Production Ruby 3.1.4 image |
| `backend/bin/railway-bootstrap` | **One-time** reset + migrate + seed |
| `backend/bin/railway-start` | **Normal** migrate + Puma |
| `.railwayignore` | Keep frontend/node_modules/data out of upload |
| `DEPLOYMENT.md` | Railway + Vercel steps |
| Several `backend/db/migrate/*` | Production schema alignment |

---

## What “good” looks like now

- **Deploy status:** latest deployment **SUCCESS**
- **Health:** `GET /api/health` → `"status":"ok"`
- **Login:** `POST /api/auth/login` with seeded user → returns **token**
- **Start command:** `bash bin/railway-start` (do **not** leave bootstrap as start command in production)

---

## Recommended next steps for you

1. **Vercel:** root `frontend`, set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_CABLE_URL` to the Railway host.
2. **Railway:** set `CORS_ORIGINS` to your live Vercel URL.
3. **Commit** local changes (Dockerfile, migrations, `bin/railway-*`, `.railwayignore`) and push so GitHub deploys match what we fixed via CLI uploads.
4. **Remove duplicate Postgres** in Railway if you only need one database.
5. **Rotate secrets** if any DB URLs or JWT values were ever printed in logs or chat.

---

## One-line summary

Deployment failed many times because the monorepo was built as Node, Rails production secrets and `tmp/` layout were incomplete, migrations referenced tables/columns that did not match the models, and seed/login needed extra columns — once Dockerfile + env + migrations + safe start script were in place, the API came online and seed/login worked.
