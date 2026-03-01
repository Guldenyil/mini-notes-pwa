# Task 8 - Production Smoke Tests

Date: 2026-03-01

## Goal

Run a minimal production-like smoke test suite to verify deployed runtime basics:

- API health
- User registration and login
- Authenticated protected endpoint access
- CORS enforcement

## Test Environment

- Server start mode: `NODE_ENV=production npm start`
- Port: `3003`
- CORS whitelist: `CORS_ORIGIN=http://localhost:5173`

## Smoke Test Results

1. **Health check**
   - Request: `GET /health`
   - Status: `200`
   - Body: `{"status":"ok","database":"connected"}`

2. **Register user**
   - Request: `POST /api/auth/register`
   - Origin: `http://localhost:5173`
   - Status: `201`
   - Result: account created with access/refresh tokens

3. **Login user**
   - Request: `POST /api/auth/login`
   - Origin: `http://localhost:5173`
   - Status: `200`
   - Result: login successful with JWT tokens

4. **Access protected endpoint**
   - Request: `GET /api/notes` with `Authorization: Bearer <accessToken>`
   - Origin: `http://localhost:5173`
   - Status: `200`
   - Body shape: `{"success":true,"data":[],"count":0}`

5. **Blocked origin check**
   - Request: preflight `OPTIONS /api/auth/login`
   - Origin: `https://blocked.example.com`
   - Status: `403`
   - Body: `{"message":"CORS origin not allowed"}`

## Conclusion

Task 8 acceptance is satisfied: core API/auth flows and CORS policy work correctly in production-like runtime settings.
