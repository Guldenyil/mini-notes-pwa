# Mini Notes PWA

Mini Notes is a full-stack project with:
- Node.js + Express backend
- PostgreSQL database (Neon recommended)
- Vite vanilla JavaScript client

This README is intentionally short and focused on running the project quickly after clone.

## Submission Scope (Client Assignment)

Implemented under `client/public`:
- `index.html`, `app.mjs`, `app.css`
- UI / Logic / Data separation
- Single central fetch call in `data/api-client.mjs`
- Custom web component for user create/edit/delete (`ui/user-manager.component.mjs`)
- Relative API URLs (`/api`)

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL connection string

Recommended:
- Neon PostgreSQL (cloud)

## Quick Run (Step by Step)

### 1) Clone

```bash
git clone <your-repo-url>
cd mini-notes-pwa
```

### 2) Configure server environment

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and set:

```env
DATABASE_URL=postgresql://username:password@hostname.neon.tech/databasename?sslmode=verify-full
JWT_SECRET=your-strong-random-secret-min-32-chars
CORS_ORIGIN=http://localhost:5173
```

For production deployment, set `CORS_ORIGIN` to your deployed client URL (or a comma-separated list):

```env
CORS_ORIGIN=https://your-client.onrender.com
```

### 3) Run migration

```bash
npm run migrate
```

### 4) Start backend

```bash
npm run dev
```

Backend URL: `http://localhost:3000`

### 5) Start client (new terminal)

```bash
cd client
npm install
npm run dev
```

Client URL: `http://localhost:5173`

Client API URL configuration:

- Local development: keep `client/.env` empty (defaults to `http://localhost:3000`)
- Production/preview: set `VITE_API_URL` to your deployed API origin

Example:

```env
VITE_API_URL=https://mini-notes-api.onrender.com
```

## Demo Account

Use this account to log in quickly:

- Email: `demo@test.com`
- Password: `Demo123!`

If the account does not exist in your current database, create it:

```bash
cd server
node create-demo-account.js
```

## Verification

- Health check:

```bash
curl http://localhost:3000/health
```

Expected response includes:
- `status: ok`
- `database: connected`

## Live Deployment

- API Base URL: `https://mini-notes-api.onrender.com/api`
- Health URL: `https://mini-notes-api.onrender.com/health`

## Test Commands

Client tests and build:

```bash
cd client
npm test
npm run build
```

## Render Migration Strategy

For Render deployment, run migrations as part of deploy before starting the API:

```bash
cd server
npm run migrate:deploy
npm start
```

Notes:
- Schema migration is idempotent and does not drop existing data.
- Set `DATABASE_URL` in Render environment variables.

## Notes for Evaluator

- If Neon is not available, local PostgreSQL can be used by setting `DATABASE_URL` to local credentials.
- Additional detailed setup and architecture docs are available in:
  - `SETUP_GUIDE.md`
  - `API.md`
  - `USER_AUTH_IMPLEMENTATION.md`
  - `docs/TASK5_RENDER_WEB_SERVICE_SETUP.md`
  - `docs/TASK7_CORS_AUTH_VALIDATION.md`
  - `docs/TASK8_PRODUCTION_SMOKE_TESTS.md`
