# Task 7 - Cloud CORS and Auth Validation

Date: 2026-03-01

## Goal

Validate that API CORS policy allows only configured client origins and that authentication endpoints continue to work for allowed origins.

## Implementation

Server now uses environment-based CORS allowlist in `server/index.js`:

- Reads `CORS_ORIGIN` (comma-separated origins)
- Allows requests with no `Origin` header (server-to-server/CLI)
- Allows configured origins only
- Rejects non-whitelisted origins

Default behavior:

- Development without `CORS_ORIGIN`: `http://localhost:5173` allowed
- Production without `CORS_ORIGIN`: no browser origins allowed

## Environment Example

```env
CORS_ORIGIN=http://localhost:5173,https://your-client.onrender.com
```

## Validation Steps

1. Start API with `CORS_ORIGIN=http://localhost:5173`.
2. Send preflight request from allowed origin:
   - `Origin: http://localhost:5173`
   - Result includes `Access-Control-Allow-Origin: http://localhost:5173`
3. Send preflight request from blocked origin:
   - `Origin: https://evil.example.com`
   - Result does not return successful CORS preflight.
4. Send auth request from allowed origin:
   - `POST /api/auth/login`
   - Result: successful auth response.

## Validation Results (Observed)

- Allowed preflight (`Origin: http://localhost:5173`): `204 No Content`
- Disallowed preflight (`Origin: https://evil.example.com`): `403 Forbidden`
- Allowed auth login (`POST /api/auth/login` from localhost origin): `200 OK`

## Acceptance Criteria

- CORS is restricted to configured domain(s).
- Allowed origin can call auth endpoints successfully.
- Disallowed origin fails CORS policy.
