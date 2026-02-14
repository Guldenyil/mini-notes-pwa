# Database Setup

This directory contains database configuration and schema files for the Mini Notes application.

## Files

- **schema.sql** - PostgreSQL database schema with tables, indexes, and sample data
- **connection.js** - Database connection pool and query helpers

## Setup Instructions

### 1. Start PostgreSQL Database

Use Docker Compose from the project root:

```bash
cd ../db
docker-compose up -d
```

This will start PostgreSQL on `localhost:5432` with:
- Database: `mini_notes`
- User: `postgres`
- Password: `postgres`

### 2. Create Database Schema

Run the schema file to create tables:

```bash
# Using psql command line
psql -h localhost -U postgres -d mini_notes -f schema.sql

# Or using Docker:
docker exec -i mini-notes-db psql -U postgres -d mini_notes < schema.sql
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update if needed:

```bash
cp .env.example .env
```

Default configuration:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_notes
DB_USER=postgres
DB_PASSWORD=postgres
```

### 4. Verify Connection

Start the server and check the console for connection message:

```bash
npm run dev
```

You should see: `[Done] Connected to PostgreSQL database`

## Database Schema

### Notes Table

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

### Users Table (for future use)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

Performance indexes created:
- `idx_notes_category` - Category filtering
- `idx_notes_is_pinned` - Pinned status filtering
- `idx_notes_created_at` - Sort by creation date
- `idx_notes_updated_at` - Sort by update date
- `idx_notes_search` - Full-text search on title and content

## Sample Data

The schema includes 3 sample notes for testing:
1. Shopping List (personal, pinned)
2. Meeting Notes (work)
3. Recipe Ideas (personal)

## Useful Commands

### Connect to Database

```bash
# Using psql
psql -h localhost -U postgres -d mini_notes

# Using Docker
docker exec -it mini-notes-db psql -U postgres -d mini_notes
```

### Check Tables

```sql
\dt                    -- List all tables
\d notes              -- Describe notes table
SELECT * FROM notes;  -- View all notes
```

### Reset Database

```bash
# Drop and recreate schema
docker exec -i mini-notes-db psql -U postgres -d mini_notes < schema.sql
```

### Stop Database

```bash
cd ../db
docker-compose down
```

### Stop and Remove Data

```bash
cd ../db
docker-compose down -v
```

## Troubleshooting

**Connection refused:**
- Check Docker is running: `docker ps`
- Check PostgreSQL is running: `docker-compose ps`
- Verify port 5432 is not already in use

**Authentication failed:**
- Check `.env` file has correct credentials
- Default credentials are postgres/postgres

**Database doesn't exist:**
```bash
# Create database manually
docker exec -it mini-notes-db psql -U postgres -c "CREATE DATABASE mini_notes;"
```

**Schema errors:**
- Drop all tables and re-run schema.sql
- Check PostgreSQL version compatibility (15+)
