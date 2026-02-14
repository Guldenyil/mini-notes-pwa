# API Testing

This directory contains API testing tools and collections for the Mini Notes API.

## Available Collections

### Postman/Bruno Collection
- **File:** `mini-notes-api.postman_collection.json`
- **Format:** Postman Collection v2.1 (compatible with Postman, Bruno, Insomnia)

## How to Use

### Option 1: Postman

1. **Download Postman:** https://www.postman.com/downloads/
2. **Import Collection:**
   - Open Postman
   - Click "Import" button
   - Select `mini-notes-api.postman_collection.json`
   - Collection will appear in your workspace

3. **Set Base URL:**
   - Collection already includes `{{baseUrl}}` variable set to `http://localhost:3000`
   - Can be changed in Collection Variables if needed

4. **Run Tests:**
   - Start your server: `cd server && npm run dev`
   - Click on any request and hit "Send"

### Option 2: Bruno (Recommended - Open Source)

1. **Download Bruno:** https://www.usebruno.com/downloads
2. **Import Collection:**
   - Open Bruno
   - Click "Import Collection"
   - Select `mini-notes-api.postman_collection.json`
   - Collection will be imported

3. **Run Tests:**
   - Start your server
   - Select requests and execute

### Option 3: Insomnia

1. **Download Insomnia:** https://insomnia.rest/download
2. **Import Collection:**
   - Open Insomnia
   - Click "Import/Export" > "Import Data"
   - Select `mini-notes-api.postman_collection.json`

3. **Run Tests:**
   - Start your server
   - Execute requests

## Available Requests

### Notes CRUD Operations

1. **Get All Notes** - `GET /api/notes`
   - Retrieve all notes
   
2. **Get All Notes (with filters)** - `GET /api/notes?category=personal&isPinned=true`
   - Filter by category, pinned status, sort
   
3. **Search Notes** - `GET /api/notes?search=shopping`
   - Search in title and content
   
4. **Get Single Note** - `GET /api/notes/:id`
   - Retrieve specific note
   
5. **Create Note** - `POST /api/notes`
   - Create new note with full details
   
6. **Create Note (Minimal)** - `POST /api/notes`
   - Create note with only required fields
   
7. **Create Note (Work Category)** - `POST /api/notes`
   - Create work-related note example
   
8. **Update Note** - `PUT /api/notes/:id`
   - Update existing note (full)
   
9. **Update Note (Partial)** - `PUT /api/notes/:id`
   - Update only specific fields
   
10. **Delete Note** - `DELETE /api/notes/:id`
    - Permanently delete note

### Utility

11. **Health Check** - `GET /health`
    - Verify server is running

## Testing Workflow

### Basic Testing Flow:

```bash
# 1. Start the server
cd server
npm run dev

# 2. Open your API client (Postman/Bruno/Insomnia)

# 3. Test in this order:
# - Health Check (verify server is running)
# - Create Note (create some test data)
# - Get All Notes (verify creation)
# - Get Single Note (test retrieval)
# - Update Note (test modification)
# - Delete Note (test deletion)
```

### Testing Scenarios:

**Scenario 1: Basic CRUD**
1. Health Check -> Should return `{ status: 'ok' }`
2. Create Note -> Should return 201 with created note
3. Get All Notes -> Should include the new note
4. Update Note -> Should return updated note
5. Delete Note -> Should return success message

**Scenario 2: Filtering and Search**
1. Create multiple notes with different categories
2. Get All Notes with category filter
3. Search notes with keyword
4. Test sorting (by date, title)

**Scenario 3: Edge Cases**
1. Get non-existent note -> Should return 404
2. Create note without required fields -> Should return 400
3. Update non-existent note -> Should return 404
4. Delete non-existent note -> Should return 404

## Variables

The collection uses the following variable:

- `baseUrl`: Base URL of the API (default: `http://localhost:3000`)

You can modify this in your API client's environment settings.

## Notes

- All requests use `Content-Type: application/json`
- Replace `:id` parameters with actual note IDs when testing
- Some requests include example data that can be modified
- Error responses follow consistent format documented in API.md
