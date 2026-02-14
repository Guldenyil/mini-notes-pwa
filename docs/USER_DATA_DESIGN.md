# User Data Design - GDPR Compliant

## Overview
This document outlines the user data we collect, following GDPR principles of data minimization and purpose limitation.

## Data Collection Strategy

### Personal Data (Minimum Required)
Following GDPR data minimization principles, we collect only:

1. **Email Address** (Required)
   - Purpose: User identification, account recovery
   - Legal basis: Contractual necessity
   - Retention: Until account deletion
   - Format: Valid email, max 255 characters

2. **Password Hash** (Required)
   - Purpose: Authentication security
   - Legal basis: Security of processing
   - Retention: Until account deletion
   - Storage: Bcrypt hash (never plaintext)

3. **Username** (Required)
   - Purpose: User identification, display name
   - Legal basis: Contractual necessity
   - Retention: Until account deletion
   - Format: 3-30 alphanumeric characters

### Metadata (Automatically Generated)
1. **User ID** - Unique identifier
2. **Created At** - Account creation timestamp
3. **Updated At** - Last account modification
4. **ToS Accepted At** - Timestamp of ToS consent
5. **ToS Version Accepted** - Version of ToS user consented to

### What We DO NOT Collect
- Real names
- Phone numbers
- Physical addresses
- Date of birth
- Government IDs
- Payment information (no billing)
- Third-party OAuth data
- Tracking cookies (beyond essential session)
- IP addresses (not stored)
- Device fingerprints
- Browsing history

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  tos_accepted_at TIMESTAMP NOT NULL,
  tos_version_accepted VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL  -- Soft delete for data retention compliance
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category VARCHAR(50),
  color VARCHAR(7),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

## Authentication Architecture

### Session-Based Authentication
- JWT tokens stored in httpOnly cookies
- Short-lived access tokens (15 minutes)
- Refresh tokens (7 days)
- Token stored in localStorage for PWA offline capability

### Separation of Concerns
1. **Authentication Middleware** - Validates tokens, attaches user to request
2. **Authorization Middleware** - Checks resource ownership
3. **API Endpoints** - Focus only on business logic

```
Request -> Auth Middleware -> Authorization -> Endpoint
         (Who are you?)   (Can you access?) (Do the thing)
```

## Account Deletion

### Right to be Forgotten (GDPR Article 17)
When a user deletes their account:

1. **Personal Data** - Immediately deleted:
   - Email
   - Password hash
   - Username
   - All metadata

2. **User-Generated Content** - User chooses:
   - Option A: Delete all notes
   - Option B: Anonymize notes (replace user_id with NULL or deleted_user)

3. **Audit Trail** - Minimal retention:
   - Log "User [ID] deleted account at [timestamp]"
   - No personal data stored in logs
   - Logs deleted after 30 days

## Security Measures

1. **Password Security**
   - Bcrypt with cost factor 12
   - Minimum 8 characters
   - No password reset without email verification

2. **Rate Limiting**
   - Login attempts: 5 per 15 minutes per email
   - Registration: 3 per hour per IP
   - API calls: 100 per minute per user

3. **Session Security**
   - HttpOnly cookies (prevents XSS)
   - Secure flag (HTTPS only)
   - SameSite=Strict (prevents CSRF)
   - Session rotation on privilege escalation

4. **Data Encryption**
   - TLS 1.3 in transit
   - Database credentials in environment variables
   - No sensitive data in logs

## User Rights (GDPR Compliance)

1. **Right to Access** - Export all user data
2. **Right to Rectification** - Update email/username
3. **Right to Erasure** - Delete account
4. **Right to Data Portability** - JSON export
5. **Right to Object** - Opt-out of future features
6. **Right to Withdraw Consent** - Delete account anytime

## Consent Management

- Explicit checkbox for ToS/Privacy Policy
- Cannot use app without consent
- Version tracking of accepted policies
- Re-consent required for material changes
- Clear "I agree" action (no pre-checked boxes)

## Data Retention Policy

- Active accounts: Indefinite (while in use)
- Inactive accounts: No automatic deletion
- Deleted accounts: All data removed within 48 hours
- Backup tapes: Overwritten within 30 days
- Logs: 30 days maximum retention

## Compliance Notes

This design follows:
- GDPR (EU General Data Protection Regulation)
- Data minimization principles
- Purpose limitation
- Storage limitation
- Security of processing
- Privacy by design
