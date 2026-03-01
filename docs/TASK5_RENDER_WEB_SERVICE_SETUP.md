# Task 5 - Render Web Service Setup

Date: 2026-03-01

## Goal

Deploy the API server as a running Render Web Service (free tier).

## Deployment Configuration

Project includes `render.yaml` at repository root:

- Service type: `web`
- Runtime: `node`
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm run migrate:deploy && npm start`
- Health check: `/health`

## Required Environment Variables (Render)

- `DATABASE_URL` (Render PostgreSQL URL)
- `JWT_SECRET`
- `NODE_ENV=production`
- `JWT_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`

## Setup Steps in Render Dashboard

1. Create **Web Service** from repository.
2. Render auto-detects `render.yaml`.
3. Set required environment variables.
4. Trigger deploy.
5. Verify health endpoint:

```bash
curl https://mini-notes-api.onrender.com/health
```

Expected response:

```json
{"status":"ok","database":"connected"}
```

## Acceptance Criteria

- A public Render API URL is running.
- `/health` responds with HTTP 200 and connected database status.
