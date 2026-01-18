# Mini Notes PWA

A lightweight Progressive Web App for note-taking with user accounts, offline functionality, and cloud sync capabilities. This project demonstrates modern web development practices with a REST API backend, PostgreSQL database, and PWA features.

## Course Requirements Mapping

This project fulfills the following course requirements:

- **Client**: Vite-based vanilla JavaScript PWA with offline capabilities
- **Server**: Node.js/Express REST API with authentication and CRUD operations
- **User Accounts**: Registration and login system with secure authentication
- **PostgreSQL Cloud Storage**: Database hosted in the cloud (PostgreSQL on Render/Neon/Supabase - to be implemented)
- **REST-ish API**: RESTful endpoints for authentication and notes management
- **Progressive Web App**: Installable app with manifest and service worker
- **Offline Functionality**: Service worker caching + IndexedDB for offline CRUD with sync queue

## Feature Map

### MVP Features (Phase 1)
- User registration and login
- Create, read, update, delete notes
- Basic note listing and detail view
- PostgreSQL database (local development, cloud production)
- RESTful API endpoints
- PWA app shell caching (offline app structure)
- Basic responsive UI

### Later Features (Phase 2+)
- Offline CRUD with IndexedDB
- Background sync queue for offline changes
- Note search and filtering
- Note categories/tags
- Rich text formatting
- Note sharing capabilities
- PWA install prompt
- Push notifications for reminders

## Initial Data Model

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notes Table
```sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Sketch

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
  - Body: `{ username, email, password }`
  - Returns: `{ userId, token }`
  
- `POST /api/auth/login` - Login existing user
  - Body: `{ email, password }`
  - Returns: `{ userId, token }`

### Notes Endpoints
- `GET /api/notes` - Get all notes for authenticated user
  - Headers: `Authorization: Bearer <token>`
  - Returns: `[{ id, title, content, created_at, updated_at }]`

- `POST /api/notes` - Create new note
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ title, content }`
  - Returns: `{ id, title, content, created_at, updated_at }`

- `GET /api/notes/:id` - Get single note
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ id, title, content, created_at, updated_at }`

- `PUT /api/notes/:id` - Update note
  - Headers: `Authorization: Bearer <token>`
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

## How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose (for PostgreSQL)
- Git

### 1. Start PostgreSQL Database (Optional - for Phase 2)
```bash
cd db
docker-compose up -d
```

### 2. Start Server
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
Server will run on `http://localhost:3000`

### 3. Start Client
```bash
# In a new terminal
cd client
npm install
npm run dev
```
Client will run on `http://localhost:5173`

### 4. Verify Setup
- Open browser to `http://localhost:5173`
- Click "Check Server Health" button
- Should see "Server Status: ✓ Online"

### Stopping Services
```bash
# Stop client and server (Ctrl+C in each terminal)

# Stop database
cd db
docker-compose down
```

## Development Notes

### Environment Variables
Copy `.env.example` to `.env` in the server directory and adjust values as needed for local development.

### Database Connection
PostgreSQL connection will be implemented in Phase 2 when authentication and notes CRUD are fully developed. For now, docker-compose is ready for local database setup.

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
