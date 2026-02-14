/**
 * Validation schemas for notes API
 */

export const createNoteSchema = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 200,
    trim: true,
    errorMessage: 'Title is required and must be between 1-200 characters'
  },
  content: {
    required: true,
    maxLength: 10000,
    errorMessage: 'Content is required and must not exceed 10000 characters'
  },
  category: {
    required: false,
    maxLength: 50,
    trim: true
  },
  color: {
    required: false,
    pattern: /^#[0-9A-Fa-f]{6}$/,
    errorMessage: 'Color must be in hex format (#RRGGBB)'
  },
  isPinned: {
    required: false,
    type: 'boolean',
    default: false
  }
};

export const updateNoteSchema = {
  title: {
    required: false,
    minLength: 1,
    maxLength: 200,
    trim: true,
    errorMessage: 'Title must be between 1-200 characters'
  },
  content: {
    required: false,
    maxLength: 10000,
    errorMessage: 'Content must not exceed 10000 characters'
  },
  category: {
    required: false,
    maxLength: 50,
    trim: true
  },
  color: {
    required: false,
    pattern: /^#[0-9A-Fa-f]{6}$/,
    errorMessage: 'Color must be in hex format (#RRGGBB)'
  },
  isPinned: {
    required: false,
    type: 'boolean'
  }
};

export const noteIdSchema = {
  id: {
    required: true,
    type: 'number',
    min: 1,
    transform: (value) => parseInt(value, 10),
    errorMessage: 'Valid note ID is required'
  }
};

export const noteQuerySchema = {
  category: {
    required: false,
    maxLength: 50,
    trim: true
  },
  isPinned: {
    required: false,
    type: 'boolean',
    transform: (value) => value === 'true' || value === true
  },
  search: {
    required: false,
    maxLength: 100,
    trim: true
  },
  sortBy: {
    required: false,
    enum: ['title', 'created_at', 'updated_at'],
    default: 'created_at'
  },
  order: {
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc'
  }
};

