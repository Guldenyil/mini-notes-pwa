# Mini Notes API Documentation

## Overview

This RESTful API provides endpoints for managing notes in the Mini Notes PWA application. The API follows REST conventions and uses JSON for request and response payloads.

**Base URL:** `http://localhost:3000`

**API Version:** v1

**Content Type:** `application/json`

---

## Data Model

### Note Object

```json
{
  "id": "integer",
  "title": "string",
  "content": "string",
  "category": "string (optional)",
  "color": "string (optional, hex color)",
  "isPinned": "boolean",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Field Descriptions:**
- `id`: Unique identifier (auto-generated)
- `title`: Note title (required, max 200 characters)
- `content`: Note content (required, max 10000 characters)
- `category`: Optional category/tag for organization
- `color`: Optional color for visual organization (hex format: #RRGGBB)
- `isPinned`: Whether note is pinned to top (default: false)
- `createdAt`: Timestamp when note was created
- `updatedAt`: Timestamp when note was last modified

---

## Endpoints

### 1. Get All Notes

Retrieve all notes, optionally filtered by query parameters.

**Endpoint:** `GET /api/notes`

**Query Parameters:**
- `category` (optional): Filter by category
- `isPinned` (optional): Filter by pinned status (true/false)
- `search` (optional): Search in title and content
- `sortBy` (optional): Sort field (createdAt, updatedAt, title)
- `order` (optional): Sort order (asc, desc)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Shopping List",
      "content": "- Milk\n- Eggs\n- Bread",
      "category": "personal",
      "color": "#FFE5B4",
      "isPinned": true,
      "createdAt": "2026-01-20T10:30:00Z",
      "updatedAt": "2026-01-20T10:30:00Z"
    },
    {
      "id": 2,
      "title": "Meeting Notes",
      "content": "Discussed project timeline and deliverables",
      "category": "work",
      "color": "#E3F2FD",
      "isPinned": false,
      "createdAt": "2026-01-21T14:15:00Z",
      "updatedAt": "2026-01-21T16:45:00Z"
    }
  ],
  "count": 2
}
```

**Error Response:** `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Failed to retrieve notes"
}
```

---

### 2. Get Single Note

Retrieve a specific note by ID.

**Endpoint:** `GET /api/notes/:id`

**Path Parameters:**
- `id` (required): Note ID (integer)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Shopping List",
    "content": "- Milk\n- Eggs\n- Bread",
    "category": "personal",
    "color": "#FFE5B4",
    "isPinned": true,
    "createdAt": "2026-01-20T10:30:00Z",
    "updatedAt": "2026-01-20T10:30:00Z"
  }
}
```

**Error Response:** `404 Not Found`

```json
{
  "success": false,
  "error": "Note not found"
}
```

---

### 3. Create Note

Create a new note.

**Endpoint:** `POST /api/notes`

**Request Body:**

```json
{
  "title": "Shopping List",
  "content": "- Milk\n- Eggs\n- Bread",
  "category": "personal",
  "color": "#FFE5B4",
  "isPinned": true
}
```

**Required Fields:**
- `title`: string (1-200 characters)
- `content`: string (0-10000 characters)

**Optional Fields:**
- `category`: string
- `color`: string (hex color format)
- `isPinned`: boolean (default: false)

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 3,
    "title": "Shopping List",
    "content": "- Milk\n- Eggs\n- Bread",
    "category": "personal",
    "color": "#FFE5B4",
    "isPinned": true,
    "createdAt": "2026-01-25T09:00:00Z",
    "updatedAt": "2026-01-25T09:00:00Z"
  },
  "message": "Note created successfully"
}
```

**Error Response:** `400 Bad Request`

```json
{
  "success": false,
  "error": "Title is required and must be between 1-200 characters"
}
```

---

### 4. Update Note

Update an existing note.

**Endpoint:** `PUT /api/notes/:id`

**Path Parameters:**
- `id` (required): Note ID (integer)

**Request Body:**

```json
{
  "title": "Updated Shopping List",
  "content": "- Milk\n- Eggs\n- Bread\n- Butter",
  "category": "personal",
  "color": "#FFE5B4",
  "isPinned": false
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Shopping List",
    "content": "- Milk\n- Eggs\n- Bread\n- Butter",
    "category": "personal",
    "color": "#FFE5B4",
    "isPinned": false,
    "createdAt": "2026-01-20T10:30:00Z",
    "updatedAt": "2026-01-25T09:15:00Z"
  },
  "message": "Note updated successfully"
}
```

**Error Response:** `404 Not Found`

```json
{
  "success": false,
  "error": "Note not found"
}
```

**Error Response:** `400 Bad Request`

```json
{
  "success": false,
  "error": "Invalid data provided"
}
```

---

### 5. Delete Note

Delete a note permanently.

**Endpoint:** `DELETE /api/notes/:id`

**Path Parameters:**
- `id` (required): Note ID (integer)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

**Error Response:** `404 Not Found`

```json
{
  "success": false,
  "error": "Note not found"
}
```

---

## Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 OK | Request successful |
| 201 Created | Resource created successfully |
| 400 Bad Request | Invalid request data |
| 404 Not Found | Resource not found |
| 500 Internal Server Error | Server error |

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

---

## Future Enhancements

The following features may be added in future versions:

1. **Pagination:** Add `page` and `limit` query parameters to GET /api/notes
2. **Bulk Operations:** Endpoints for bulk delete/update
3. **Note Sharing:** Share notes with other users
4. **Attachments:** Support for images and file attachments
5. **Tags:** More advanced tagging system
6. **Trash/Archive:** Soft delete functionality
7. **Version History:** Track note revisions

---

## Testing

API testing collection is available in the `/tests` directory:
- Postman/Bruno collection: `tests/mini-notes-api.json`

Import this collection into your API testing tool to test all endpoints.

---

## Notes for Developers

- All timestamps are in ISO 8601 format (UTC)
- Color values must be valid hex colors (e.g., #FF5733)
- Content supports plain text and markdown
- Category names are case-insensitive
- Empty string content is allowed but title is required
- UpdatedAt is automatically set on every update operation
