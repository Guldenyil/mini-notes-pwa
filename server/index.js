const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Temporary in-memory storage for notes (will be replaced with PostgreSQL)
let notes = [
  {
    id: 1,
    title: "Shopping List",
    content: "- Milk\n- Eggs\n- Bread",
    category: "personal",
    color: "#FFE5B4",
    isPinned: true,
    createdAt: new Date("2026-01-20T10:30:00Z").toISOString(),
    updatedAt: new Date("2026-01-20T10:30:00Z").toISOString()
  },
  {
    id: 2,
    title: "Meeting Notes",
    content: "Discussed project timeline and deliverables",
    category: "work",
    color: "#E3F2FD",
    isPinned: false,
    createdAt: new Date("2026-01-21T14:15:00Z").toISOString(),
    updatedAt: new Date("2026-01-21T16:45:00Z").toISOString()
  }
];

let nextId = 3;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes (placeholders)
app.post('/api/auth/register', (req, res) => {
  res.status(501).json({ message: 'Registration endpoint - not yet implemented' });
});

app.post('/api/auth/login', (req, res) => {
  res.status(501).json({ message: 'Login endpoint - not yet implemented' });
});

// ============================================
// NOTES API ENDPOINTS
// ============================================

// GET /api/notes - Get all notes with optional filtering
app.get('/api/notes', (req, res) => {
  try {
    const { category, isPinned, search, sortBy, order } = req.query;
    
    let filteredNotes = [...notes];
    
    // Filter by category
    if (category) {
      filteredNotes = filteredNotes.filter(note => 
        note.category && note.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by pinned status
    if (isPinned !== undefined) {
      const pinnedValue = isPinned === 'true';
      filteredNotes = filteredNotes.filter(note => note.isPinned === pinnedValue);
    }
    
    // Search in title and content
    if (search) {
      const searchLower = search.toLowerCase();
      filteredNotes = filteredNotes.filter(note =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort notes
    if (sortBy) {
      filteredNotes.sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === 'title') {
          comparison = a.title.localeCompare(b.title);
        } else if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          comparison = new Date(a[sortBy]) - new Date(b[sortBy]);
        }
        
        return order === 'desc' ? -comparison : comparison;
      });
    }
    
    res.json({
      success: true,
      data: filteredNotes,
      count: filteredNotes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notes'
    });
  }
});

// GET /api/notes/:id - Get single note by ID
app.get('/api/notes/:id', (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    const note = notes.find(n => n.id === noteId);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve note'
    });
  }
});

// POST /api/notes - Create new note
app.post('/api/notes', (req, res) => {
  try {
    const { title, content, category, color, isPinned } = req.body;
    
    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Title is required and must be between 1-200 characters'
      });
    }
    
    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'Title must not exceed 200 characters'
      });
    }
    
    if (content === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }
    
    if (content.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Content must not exceed 10000 characters'
      });
    }
    
    // Validate color format if provided
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({
        success: false,
        error: 'Color must be in hex format (#RRGGBB)'
      });
    }
    
    // Create new note
    const newNote = {
      id: nextId++,
      title: title.trim(),
      content,
      category: category || null,
      color: color || null,
      isPinned: isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    notes.push(newNote);
    
    res.status(201).json({
      success: true,
      data: newNote,
      message: 'Note created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create note'
    });
  }
});

// PUT /api/notes/:id - Update existing note
app.put('/api/notes/:id', (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    const noteIndex = notes.findIndex(n => n.id === noteId);
    
    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    const { title, content, category, color, isPinned } = req.body;
    
    // Validate if fields are provided
    if (title !== undefined) {
      if (!title || title.trim().length === 0 || title.length > 200) {
        return res.status(400).json({
          success: false,
          error: 'Title must be between 1-200 characters'
        });
      }
    }
    
    if (content !== undefined && content.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Content must not exceed 10000 characters'
      });
    }
    
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({
        success: false,
        error: 'Color must be in hex format (#RRGGBB)'
      });
    }
    
    // Update note (only update provided fields)
    const updatedNote = {
      ...notes[noteIndex],
      ...(title !== undefined && { title: title.trim() }),
      ...(content !== undefined && { content }),
      ...(category !== undefined && { category }),
      ...(color !== undefined && { color }),
      ...(isPinned !== undefined && { isPinned }),
      updatedAt: new Date().toISOString()
    };
    
    notes[noteIndex] = updatedNote;
    
    res.json({
      success: true,
      data: updatedNote,
      message: 'Note updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update note'
    });
  }
});

// DELETE /api/notes/:id - Delete note
app.delete('/api/notes/:id', (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    const noteIndex = notes.findIndex(n => n.id === noteId);
    
    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    notes.splice(noteIndex, 1);
    
    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete note'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
