# Task 10 - Final Submission Checklist

Date: 2026-03-01

## Goal

Finalize assignment submission package with verified repository links, live deployment URLs, and evidence docs.

## Submission Links

- GitHub Repository: https://github.com/Guldenyil/mini-notes-pwa
- Live API Base URL: https://mini-notes-api.onrender.com/api
- Live Health Endpoint: https://mini-notes-api.onrender.com/health

## Final Verification Snapshot

- Health endpoint returns `200` with connected database status.
- Render deployment configured for:
  - Root directory: `server`
  - Build command: `npm install`
  - Start command: `npm run migrate:deploy && npm start`
- PostgreSQL persistence verified (user creation survives restart).
- CORS allowlist active and validated with allow/deny origin checks.
- Production-like smoke tests completed for register/login/protected endpoint.

## Included Evidence Documents

- `docs/TASK4_PERSISTENCE_VERIFICATION.md`
- `docs/TASK5_RENDER_WEB_SERVICE_SETUP.md`
- `docs/TASK7_CORS_AUTH_VALIDATION.md`
- `docs/TASK8_PRODUCTION_SMOKE_TESTS.md`

## Pre-Submission Checklist

- [x] Repository is pushed and up to date
- [x] Live API URL is public and reachable
- [x] README includes live deployment details
- [x] Assignment summary includes repository + live URLs
- [x] Environment variables are configured on Render

## Ready to Submit

Submit the repository URL and live API URL required by the assignment:

- Repository: https://github.com/Guldenyil/mini-notes-pwa
- Live API: https://mini-notes-api.onrender.com/api
