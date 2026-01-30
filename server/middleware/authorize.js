/**
 * Authorization Middleware
 * 
 * Verifies WHAT resources a user can access
 * Assumes req.user is already set by auth middleware
 * 
 * Separation of concerns:
 * - API endpoints don't check permissions
 * - Authorization middleware handles all access control
 * - Clean, reusable, testable
 */

const { query } = require('../db/connection');

/**
 * Check if user owns a specific note
 * @param {number} noteId - Note ID to check
 * @param {number} userId - User ID to check ownership
 * @returns {Promise<boolean>} - True if user owns the note
 */
async function isNoteOwner(noteId, userId) {
  try {
    const result = await query(
      'SELECT id FROM notes WHERE id = $1 AND user_id = $2',
      [noteId, userId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking note ownership:', error);
    return false;
  }
}

/**
 * Middleware: Authorize note access
 * Verifies the user owns the note specified in req.params.id
 * Must be used after authenticate() and requireAuth()
 */
async function authorizeNoteAccess(req, res, next) {
  const noteId = req.params.id;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this note'
    });
  }

  if (!noteId) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Note ID is required'
    });
  }

  const isOwner = await isNoteOwner(noteId, userId);

  if (!isOwner) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to access this note'
    });
  }

  // User is authorized - continue to endpoint
  next();
}

/**
 * Middleware: Scope notes to current user
 * Automatically adds user_id filter to queries
 * Use for GET /api/notes to only show user's own notes
 */
function scopeToUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access notes'
    });
  }

  // Attach userId to query params for use in endpoint
  req.scopedUserId = req.user.id;
  next();
}

/**
 * Generic authorization helper
 * @param {Function} checkFn - Async function that returns true if authorized
 * @param {string} errorMessage - Error message if not authorized
 */
function authorize(checkFn, errorMessage = 'Access denied') {
  return async (req, res, next) => {
    try {
      const isAuthorized = await checkFn(req);
      if (!isAuthorized) {
        return res.status(403).json({
          error: 'Forbidden',
          message: errorMessage
        });
      }
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        error: 'Authorization check failed',
        message: 'An error occurred while checking permissions'
      });
    }
  };
}

module.exports = {
  authorizeNoteAccess,
  scopeToUser,
  authorize,
  isNoteOwner
};
