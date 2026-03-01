# Task 4 - User Persistence Verification (Render PostgreSQL)

Date: 2026-03-01

## Goal

Verify that creating a user account persists data in PostgreSQL and remains available after server restart.

## Environment

- API server started with Render PostgreSQL `DATABASE_URL`
- Verification port: `3001`

## Verification Steps and Results

1. **Create user via API**
   - Endpoint: `POST /api/auth/register`
   - Created user email: `render1772332313@example.com`
   - Result: `201` success response with user payload.

2. **Validate row exists in database**
   - Direct SQL check on Render PostgreSQL:
     - Query: `SELECT id,email,username,created_at FROM users WHERE email=$1`
   - Result:
     - `count = 1`
     - Row found for `render1772332313@example.com`

3. **Restart API server and test login again**
   - Server restarted on `PORT=3001` against same Render DB.
   - Endpoint: `POST /api/auth/login`
   - Credentials: `render1772332313@example.com` / `Render123!`
   - Result: `Login successful` with tokens.

## Conclusion

Persistence requirement is satisfied:

- `Client -> API -> PostgreSQL` user creation writes a persistent DB row.
- User data remains available after server restart.
