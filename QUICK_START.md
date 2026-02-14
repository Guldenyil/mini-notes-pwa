# Quick Start Checklist

Use this checklist to get Mini Notes running quickly.

## Prerequisites Check

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL running (`pg_isready`)
- [ ] Ports 3000 and 5173 available

## Setup Steps

### 1. Install Dependencies
```bash
# Server
cd server
npm install

# Client  
cd ../client
npm install
```

### 2. Configure Environment
```bash
cd server
cp .env.example .env
# Edit .env and change JWT_SECRET to a random string
```

### 3. Database Setup

**Using Docker (easiest):**
```bash
cd db
docker-compose up -d
```

**Manual setup:**
```sql
CREATE DATABASE mini_notes;
```

### 4. Run Migration
```bash
cd server
npm run migrate
```

### 5. Start Servers

**Terminal 1:**
```bash
cd server
npm run dev
```

**Terminal 2:**
```bash
cd client
npm run dev
```

### 6. Test Application

- [ ] Open http://localhost:5173
- [ ] Click "Register"
- [ ] Fill form and accept ToS
- [ ] Create account
- [ ] Log out and log in
- [ ] Go to Settings
- [ ] Export data
- [ ] View ToS/Privacy Policy

## Troubleshooting

**Database not connecting?**
```bash
# Check PostgreSQL
pg_isready

# Restart Docker
cd db && docker-compose restart
```

**Port in use?**
```bash
# Kill process on port 3000
kill -9 $(lsof -ti:3000)
```

**JWT error?**
```bash
# Make sure .env exists with JWT_SECRET
cd server
cat .env | grep JWT_SECRET
```

## What to Submit

[Done] GitHub repository URL with all implemented features:
- User registration with ToS consent [Done]
- User login with JWT [Done]
- Protected API endpoints [Done]
- Account deletion with data options [Done]
- Data export functionality [Done]
- Privacy Policy document [Done]
- Terms of Service document [Done]
- GDPR compliance [Done]

## Key Files to Review

- `ASSIGNMENT_COMPLETE.md` - Assignment summary
- `PRIVACY_POLICY.md` - Privacy policy
- `TERMS_OF_SERVICE.md` - Terms of service
- `USER_AUTH_IMPLEMENTATION.md` - Technical details
- `SETUP_GUIDE.md` - Complete setup guide
- `docs/USER_DATA_DESIGN.md` - Architecture

## Architecture Highlights

**Separation of Concerns:**
```
Request -> authenticate -> requireAuth -> authorize -> endpoint
```

**GDPR Rights Implemented:**
- Right to Access (data export)
- Right to Erasure (account deletion)
- Right to Data Portability (JSON export)
- Right to Object (delete anytime)

**Security Features:**
- Bcrypt password hashing
- JWT tokens (15min/7day)
- Rate limiting
- Protected endpoints

Done! 
