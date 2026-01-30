# Mini Notes PWA

A lightweight Progressive Web App for note-taking with offline functionality, user authentication, and GDPR-compliant account management. Built with Node.js/Express backend, PostgreSQL cloud database, and vanilla JavaScript frontend.

## 🎯 Project Status

**Current Phase:** User Authentication Complete ✓  
**Database:** PostgreSQL Cloud (Neon.tech) ✓  
**API:** Fully functional with protected endpoints ✓  
**Auth:** JWT-based authentication with GDPR compliance ✓

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Running

1. **Clone the repository**
```bash
git clone https://github.com/[your-username]/mini-notes-pwa.git
cd mini-notes-pwa
```

2. **Setup Server**
```bash
cd server
npm install
# Copy .env.example to .env and configure DATABASE_URL and JWT_SECRET
npm run dev  # Server runs on http://localhost:3000
```

3. **Setup Client** (in a new terminal)
```bash
cd client
npm install
npm run dev  # Client runs on http://localhost:5173
```

4. **Access the app**
- Open http://localhost:5173
- Register a new account
- Start creating notes!

### Environment Variables

Create `server/.env` file:
```env
PORT=3000
DATABASE_URL=your_neon_postgres_connection_string
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## Course Requirements Mapping

This project fulfills the following course requirements:

- **Client**: Vite-based vanilla JavaScript PWA with offline capabilities ✓
- **Server**: Node.js/Express REST API with CRUD operations ✓
- **User Accounts**: JWT-based registration and login system ✓
- **PostgreSQL Cloud Storage**: Database hosted on Neon.tech cloud ✓
- **REST-ish API**: RESTful endpoints for notes management ✓
- **Progressive Web App**: Installable app with manifest and service worker ✓

## 📚 Documentation

- **[API Documentation](API.md)** - Complete REST API reference with examples
- **[API Testing](tests/README.md)** - Postman/Bruno collection setup guide
- **[Database Setup](server/db/README.md)** - PostgreSQL schema and connection guide

## Feature Map

### ✅ Completed Features
- **User Authentication**
  - JWT-based registration and login
  - Access tokens (15min) + Refresh tokens (7 days)
  - Password hashing with bcrypt
  - Rate limiting on auth endpoints
- **Account Management (GDPR Compliant)**
  - User data export (JSON format)
  - Account deletion with data removal
  - Terms of Service consent tracking
  - Privacy Policy & ToS documents
- **Protected Notes API**
  - Complete CRUD operations
  - User-specific note isolation
  - Query filtering (category, pinned, search)
  - Sorting capabilities
- **Database**
  - PostgreSQL cloud (Neon.tech)
  - Users and Notes tables with foreign keys
  - Automatic timestamps and triggers
- **Modern UI**
  - Responsive registration/login forms
  - Settings page with account management
  - Notes grid with search and filters
  - Modal-based note creation/editing
- **Security & Validation**
  - Authorization middleware for resource access
  - Schema-based request validation
  - Rate limiting protection
## 🔒 Validation Middleware

This project uses **[express-request-validator](https://github.com/gueldenyildirim/express-request-validator)**, a custom zero-dependency Express middleware for declarative schema-based validation.

### Features
- **Zero dependencies** - Lightweight and secure
- **Declarative schemas** - Define validation rules as objects
- **Transform support** - Auto-convert types (strings to numbers, booleans)
- **Comprehensive validators** - Type checking, length, patterns, ranges, custom validators
- **Clean error messages** - Structured validation errors with field context
- **Flexible options** - Partial validation, strict mode, strip unknown fields

### Usage Example
```javascript
const { validate, schemas } = require('express-request-validator');

// Using predefined schema
app.post('/api/notes', 
  validate(schemas.createNoteSchema), 
  async (req, res) => {
    // req.body is validated and transformed
    const note = await createNote(req.body);
    res.json({ success: true, data: note });
  }
);
```

### Benefits
- **Code reduction**: Removed ~90 lines of manual validation code from server/index.js (370 → 280 lines)
- **Consistency**: All endpoints use the same validation approach
- **Maintainability**: Validation logic centralized in schemas
- **Reusability**: Middleware can be used across multiple projects
### 🚧 In Progress Features (Phase 2)
- User authentication and registration
- Protected API endpoints with JWT
- User-specific notes

### 📋 Planned Features (Phase 3+)
- Offline CRUD with IndexedDB
- BData Model

### Notes Table (Implemented)
```sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category VARCHAR(50),
  color VARCHAR(7),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Features:**
- Auto-incrementing IDs
- Automatic timestamps
- Trigger for auto-updating `updated_at`
- Indexes for category, pinned status, and dates
- Full-text search index on title and content

### Users Table (For Future Use)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULLe
```sql
CREATE Reference

### Implemented Endpoints

#### Notes Management
- `GET /api/notes` - Get all notes with filtering and search
  - Query params: `category`, `isPinned`, `search`, `sortBy`, `order`
  - Returns: `{ success, data: [...], count }`

- `GET /api/notes/:id` - Get single note by ID
  - Returns: `{ success, data: {...} }`

- `POST /api/notes` - Create new note
  - Body: `{ title, content, category?, color?, isPinned? }`
  - Returns: `{ success, data: {...}, message }`

- `PUT /api/notes/:id` - Update existing note
  - Body: `{ title?, content?, category?, color?, isPinned? }`
  - Returns: `{ success, data: {...}, message }`

- `DELETE /api/notes/:id` - Delete note
  - Returns: `{ success, message }`

#### Utility
- `GET /health` - Server health and database connectivity check
  - Returns: `{ status: "ok", database: "connected" }`

### Future Authentication Endpoints (Not Implemented)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user

For complete API documentation with request/response examples, see **[API.md](API.md)**arer <token>`
  - Body: `{ title, content }`
  - Returns: `{ id, title, content, updated_at }`

- `DELETE /api/notes/:id` - Delete note
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ success: true }`

### Utility Endpoints
- `GET /health` - Server health check
  - Returns: `{ status: "ok" }`

## Offline Strategy Plan

The offline functionality will be implemented in phases:

### Phase 1: App Shell Caching (Current)
- Service worker caches static assets (HTML, CSS, JS)
- App loads instantly when offline
- Basic PWA functionality with manifest

### Phase 2: Offline Data Access (Future)
- **IndexedDB Integration**: Store notes locally using IndexedDB
- **Read Operations**: Serve notes from IndexedDB when offline
- **Sync Indicator**: Show sync status to user

### Phase 3: Offline CRUD Operations (Future)
- **Local Mutations**: Allow create/update/delete operations offline
- **Sync Queue**: Queue changes in IndexedDB with pending status
- **Background Sync**: Use Background Sync API to push changes when online
- **Conflict Resolution**: Last-write-wins strategy with timestamp comparison

### Technical Implementation Plan
```javascript
// Offline storage structure (planned)
IndexedDB: {
  notes: [{ id, title, content, synced: boolean, timestamp }],
  syncQueue: [{ action, noteId, data, timestamp }]
}
```

## Project Management

### GitHub Project Board
Create a Kanban board at: `https://github.com/YOUR_USERNAME/mini-notes-pwa/projects`

**Board Columns:**
- Backlog
- In Progress
- Done

### Initial GitHub Issues

1. **Kickoff: Write README with feature map and plan**
   - Labels: `documentation`, `kickoff`
   - Description: Create comprehensive README covering all project aspects

2. **Setup: Repo structure + .gitignore**
   - Labels: `setup`, `kickoff`
   - Description: Initialize repository structure with proper .gitignore

3. **Server: Express scaffold + /health**
   - Labels: `server`, `kickoff`
   - Description: Set up Express server with health check endpoint

4. **Server: Auth route placeholders**
   - Labels: `server`, `auth`
   - Description: Add placeholder routes for registration and login

5. **Server: Notes route placeholders**
   - Labels: `server`, `notes`
   - Description: Add placeholder GET /api/notes endpoint

6. **Client: Vite scaffold + health check UI**
   - Labels: `client`, `kickoff`
   - Description: Create Vite app with UI to display server health

7. **Client: Configure dev proxy to server**
   - Labels: `client`, `configuration`
   - Description: Add Vite proxy config for /api and /health routes

8. **DB: Add docker-compose Postgres (local)**
   - Labels: `database`, `setup`
   - Description: Create docker-compose.yml for local PostgreSQL

9. **PWA: Add manifest + service worker scaffold**
   - Labels: `pwa`, `client`
   - Description: Implement basic PWA features with app shell caching

10. **CI (minimal): Add basic npm scripts and ensure both apps start**
    - Labels: `ci`, `setup`
    - Description: Verify all npm scripts work and apps start successfully

After creating these issues, add them to the Project board in the Backlog column. Move issues #1-3 to "Done" once completed.
Git
- Neon.tech account (free tier) for cloud PostgreSQL

### Quick Start

#### 1. Clone Repository
```bash
git clone <your-repo-url>
cd mini-notes-pwa
```

#### 2. Setup Database
1. Create free account at https://neon.tech
2. Create a new PostgreSQL project
3. Copy the connection string

#### 3. Configure Server
```bash
cd server
npm install
cp .env.example .env
# Edit .env and add your DATABASE_URL
```

#### 4. Run Database Migration
```bash
npm run migrate
```
This creates tables and inserts sample data.

#### 5. Start Server
```bash
npm run dev
```
Server runs on `http://localhost:3000`

#### 6. Start Client (Optional)
```bash
# In a new terminal
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`

### Testing the API

#### Option 1: Using Postman/Bruno (Recommended)
1. Install Postman (https://postman.com) or Bruno (https://usebruno.com)
2. Import collection: `tests/mini-notes-api.postman_collection.json`
3. Test all endpoints with pre-configured requests

#### Option 2: Using curl
```bash
# Health check
curl http://localhost:3000/health

# Get all notes
curl http://localhost:3000/api/notes

# Create note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Note","content":"This is a test"}'
Project Structure

```
mini-notes-pwa/
├── client/                 # Vite PWA frontend
│   ├── index.html
│   ├── main.js
│   ├── manifest.json       # PWA manifest
│   ├── service-worker.js   # Service worker for offline
│   └── package.json
├── server/                 # Express API backend
│   ├── db/
│   │   ├── connection.js   # PostgreSQL connection pool
│   │   ├── schema.sql      # Database schema
│   │   ├── migrate.js      # Migration script
│   │   └── README.md       # Database documentation
│   ├── index.js            # API routes and server
│   ├── .env                # Environment variables (gitignored)
│   ├── .env.example        # Environment template
│   └── package.json
├── tests/                  # API testing collection
│   ├── mini-notes-api.postman_collection.json
│   └── README.md
├── db/                     # Docker Compose (optional)
│   └── docker-compose.yml
├── API.md                  # Complete API documentation
└── README.md               # This file
```

## Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon.tech cloud)
- **Database Client:** node-postgres (pg)
- **Validation:** express-request-validator (custom middleware)
- **Environment:** dotenv

### Frontend
- **Build Tool:** Vite
- **Language:** Vanilla JavaScript
- **PWA:** Service Worker + Web App Manifest

### Development Tools
- **API Testing:** Postman / Bruno / Insomnia
- **Version Control:** Git + GitHub
- **Database Hosting:** Neon.tech (free tier)

## Development Notes

### Implemented Features
✅ RESTful API with 5 CRUD endpoints  
✅ PostgreSQL cloud database with Neon.tech  
✅ Declarative validation middleware (express-request-validator)  
✅ Schema-based request validation with transformations  
✅ Query filtering and search capabilities  
✅ Database indexes for performance  
✅ Auto-updating timestamps with triggers  
✅ API documentation (API.md)  
✅ API testing collection (Postman/Bruno)  
✅ Connection pooling for scalability  

### Future Enhancements
🔄 User authentication with JWT  
🔄 Protected endpoints (authorization)  
🔄 Offline functionality with IndexedDB  
🔄 Background sync for offline changes  
🔄 Client UI improvements  
🔄 Deployment to production  

## Submission

**GitHub Repository:** [Your repository URL]

**Includes:**
- ✅ Complete source code (client + server)
- ✅ API documentation (API.md)
- ✅ Database schema and setup scripts
- ✅ API testing collection
- ✅ Comprehensive README
- ✅ Working API with cloud database

---

**Project Status:** Phase 1 Complete - RESTful API Scaffolded ✓  
**Next Phase:** User Authentication & Authoriz

**Server (.env):**
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host/database?sslmode=verify-full
```

See `server/.env.example` for template.cation and notes CRUD are fully developed. For now, docker-compose is ready for local database setup.

### Cloud Deployment Plan
- **Database**: PostgreSQL on Neon/Render/Supabase (free tier)
- **Server**: Deploy to Render/Railway/Fly.io
- **Client**: Deploy to Netlify/Vercel with service worker support

## Submission

**Submit:** GitHub repository URL

Repository should include:
- Complete source code (client + server)
- This README with documentation
- GitHub Project board with issues
- Working scaffold that passes health check

---

**Project Status:** Kickoff Complete ✓  
**Next Phase:** Implement authentication and database integration
