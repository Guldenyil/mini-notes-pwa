# Setup Guide - Mini Notes with User Authentication

This guide will help you set up and run the Mini Notes application with full user authentication.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git (for cloning the repository)

## Quick Start

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

### 2. Set Up Database

#### Option A: Using Docker (Recommended)

```bash
cd db
docker-compose up -d
```

This will start PostgreSQL on port 5432 with the following credentials:
- Database: `mini_notes`
- User: `postgres`
- Password: `postgres`

#### Option B: Manual PostgreSQL Setup

1. Create database:
```sql
CREATE DATABASE mini_notes;
```

2. Update `server/.env` with your credentials

### 3. Configure Environment Variables

```bash
cd server
cp .env.example .env
```

**IMPORTANT**: Edit `.env` and change the `JWT_SECRET` to a strong random value:

```env
JWT_SECRET=your-super-secret-random-string-min-32-characters-long
```

You can generate a secure secret with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run Database Migrations

```bash
cd server
npm run migrate
```

This will:
- Create the `users` table
- Create the `notes` table
- Set up indexes and triggers

### 5. Start the Development Servers

#### Terminal 1 - Backend Server

```bash
cd server
npm run dev
```

Server will start on http://localhost:3000

#### Terminal 2 - Frontend Client

```bash
cd client
npm run dev
```

Client will start on http://localhost:5173

### 6. Open the Application

Visit http://localhost:5173 in your browser

## Testing the Application

### Manual Testing Flow

1. **Register a New User**
   - Click "Register"
   - Fill in username, email, password
   - Review ToS and Privacy Policy
   - Check the consent checkbox
   - Click "Create Account"

2. **Verify Registration**
   - You should be automatically logged in
   - See the main app with your username displayed

3. **Test Settings**
   - Click "Settings"
   - View your account information
   - Click "Export All Data" to download your data

4. **Test Legal Documents**
   - Click "View Terms of Service"
   - Click "View Privacy Policy"
   - Verify they display correctly

5. **Test Logout**
   - Click "Logout"
   - Verify you're redirected to login

6. **Test Login**
   - Log in with your credentials
   - Verify you're back in the app

7. **Test Account Deletion**
   - Go to Settings
   - Click "Delete Account" (in Danger Zone)
   - Follow the confirmation prompts
   - Verify account is deleted

### API Testing with curl

#### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "tosAccepted": true
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Get Current User (requires token)
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Create a Note (requires token)
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Test Note",
    "content": "This is a test note",
    "category": "personal",
    "color": "#FFE5B4"
  }'
```

#### Get All Notes (requires token)
```bash
curl http://localhost:3000/api/notes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Structure

```
mini-notes-pwa/
├── server/                      # Backend API
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   ├── authorize.js        # Authorization middleware
│   │   └── rateLimiter.js      # Rate limiting
│   ├── routes/
│   │   ├── auth.js             # Auth endpoints
│   │   └── account.js          # Account management
│   ├── db/
│   │   ├── connection.js       # Database connection
│   │   ├── schema.sql          # Database schema
│   │   └── migrate.js          # Migration script
│   ├── index.js                # Main server file
│   ├── package.json
│   └── .env.example
│
├── client/                      # Frontend PWA
│   ├── auth.js                 # Authentication manager
│   ├── ui.js                   # UI manager
│   ├── main.js                 # Entry point
│   ├── index.html
│   ├── styles.css              # Complete styling
│   ├── manifest.json
│   ├── service-worker.js
│   └── package.json
│
├── docs/                        # Documentation
│   └── USER_DATA_DESIGN.md     # Architecture details
│
├── PRIVACY_POLICY.md           # Privacy policy
├── TERMS_OF_SERVICE.md         # Terms of service
└── USER_AUTH_IMPLEMENTATION.md # Implementation guide
```

## Key Features Implemented

### ✅ User Authentication
- Registration with username, email, password
- Login with email/password
- JWT token-based authentication
- Automatic token refresh
- Logout functionality

### ✅ GDPR Compliance
- Data minimization (only essential data)
- Explicit consent (ToS acceptance)
- Right to access (data export)
- Right to erasure (account deletion)
- Right to data portability (JSON export)

### ✅ Security
- Bcrypt password hashing (cost 12)
- JWT tokens (15min access, 7day refresh)
- Rate limiting on all endpoints
- Protected API routes
- Authorization checks

### ✅ Legal Documents
- Comprehensive Privacy Policy
- Complete Terms of Service
- Consent tracking with versioning

### ✅ User Interface
- Registration form with ToS consent
- Login form
- Main application view
- Settings/Account management
- Document viewer modals
- Responsive design

## Troubleshooting

### Database Connection Errors

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Make sure PostgreSQL is running
```bash
# Check if PostgreSQL is running
pg_isready

# If using Docker
docker-compose ps

# Start Docker containers
cd db
docker-compose up -d
```

### JWT Secret Not Set

```
Error: secretOrPrivateKey must have a value
```

**Solution**: Make sure `.env` file exists with `JWT_SECRET` set
```bash
cd server
cp .env.example .env
# Edit .env and set a strong JWT_SECRET
```

### Port Already in Use

```
Error: listen EADDRINUSE :::3000
```

**Solution**: Kill the process using the port
```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)
```

### Migration Fails

```
Error: relation "users" already exists
```

**Solution**: Drop and recreate the database
```bash
# Connect to PostgreSQL
psql -U postgres

# Drop and recreate
DROP DATABASE mini_notes;
CREATE DATABASE mini_notes;
\q

# Run migration again
cd server
npm run migrate
```

## Security Considerations

### Development vs Production

This setup is for **DEVELOPMENT ONLY**. For production:

1. **Change JWT Secret**: Use a cryptographically secure random string
2. **Enable HTTPS**: Use TLS 1.3
3. **Secure Database**: Use strong password, limit access
4. **Rate Limiting**: Consider using Redis for distributed rate limiting
5. **CORS**: Configure properly for your domain
6. **Environment Variables**: Use proper secrets management
7. **Logging**: Set up proper logging and monitoring
8. **Backups**: Implement automated database backups
9. **Email Verification**: Add email confirmation
10. **Legal Review**: Have ToS/Privacy Policy reviewed by legal counsel

### Password Requirements

Current implementation requires:
- Minimum 8 characters
- Consider adding: uppercase, lowercase, numbers, special chars for production

### Token Expiry

Default configuration:
- Access token: 15 minutes
- Refresh token: 7 days

Adjust in `.env` based on your security requirements.

## Next Steps

After setting up the basic authentication:

1. **Implement Notes UI**: Build the actual note-taking interface
2. **Add Email Verification**: Require email confirmation
3. **Password Reset**: Implement forgot password flow
4. **Profile Management**: Allow username/email updates
5. **2FA**: Add two-factor authentication
6. **Session Management**: Show active sessions
7. **Audit Logs**: Track security-relevant events

## API Documentation

See [API.md](API.md) for complete API documentation.

## Support

If you encounter issues:
1. Check this README
2. Review [USER_AUTH_IMPLEMENTATION.md](USER_AUTH_IMPLEMENTATION.md)
3. Check [docs/USER_DATA_DESIGN.md](docs/USER_DATA_DESIGN.md)
4. Review server logs in the terminal

## License

[Your License Here]
