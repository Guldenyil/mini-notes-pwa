/**
 * User Account Routes
 * Handles account management: deletion, data export, profile updates
 */

import express from 'express';
import { query } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { deleteAccountRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * DELETE /api/account
 * Delete user account (Right to be Forgotten - GDPR Article 17)
 * 
 * User can choose what happens to their notes:
 * - deleteNotes: true = delete all notes
 * - deleteNotes: false = anonymize notes (remove user_id reference)
 */
router.delete('/',
  requireAuth,
  deleteAccountRateLimiter,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { deleteNotes = true } = req.body;

      // Start transaction
      await query('BEGIN');

      try {
        if (deleteNotes) {
          // Option A: Delete all user's notes
          await query('DELETE FROM notes WHERE user_id = $1', [userId]);
        } else {
          // Option B: Anonymize notes (set user_id to NULL)
          // This preserves content as public contribution
          // Note: This requires modifying the FK constraint to allow NULL
          await query('UPDATE notes SET user_id = NULL WHERE user_id = $1', [userId]);
        }

        // Soft delete the user (for audit purposes)
        // The deleted_at timestamp allows us to track when deletion occurred
        await query(
          'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
          [userId]
        );

        // Hard delete after soft delete (immediate permanent deletion)
        // This complies with GDPR Right to be Forgotten
        await query('DELETE FROM users WHERE id = $1', [userId]);

        // Commit transaction
        await query('COMMIT');

        res.json({
          message: 'Account deleted successfully',
          deletedNotes: deleteNotes,
          anonymizedNotes: !deleteNotes
        });
      } catch (error) {
        // Rollback on error
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      res.status(500).json({
        error: 'Account deletion failed',
        message: 'An error occurred while deleting your account. Please try again.'
      });
    }
  }
);

/**
 * GET /api/account/export
 * Export all user data in JSON format (Right to Data Portability - GDPR Article 20)
 */
router.get('/export',
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Get user data
      const userResult = await query(
        `SELECT id, username, email, tos_version_accepted, tos_accepted_at, created_at, updated_at
         FROM users 
         WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User account not found'
        });
      }

      const user = userResult.rows[0];

      // Get all user's notes
      const notesResult = await query(
        `SELECT id, title, content, category, color, is_pinned, created_at, updated_at
         FROM notes 
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      // Compile export data
      const exportData = {
        exportDate: new Date().toISOString(),
        exportVersion: '1.0.0',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          tosVersionAccepted: user.tos_version_accepted,
          tosAcceptedAt: user.tos_accepted_at,
          accountCreated: user.created_at,
          lastUpdated: user.updated_at
        },
        notes: notesResult.rows,
        statistics: {
          totalNotes: notesResult.rows.length,
          pinnedNotes: notesResult.rows.filter(n => n.is_pinned).length,
          categoryCounts: notesResult.rows.reduce((acc, note) => {
            acc[note.category || 'uncategorized'] = (acc[note.category || 'uncategorized'] || 0) + 1;
            return acc;
          }, {})
        }
      };

      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="mini-notes-data-export-${Date.now()}.json"`);
      
      res.json(exportData);
    } catch (error) {
      console.error('Data export error:', error);
      res.status(500).json({
        error: 'Export failed',
        message: 'An error occurred while exporting your data. Please try again.'
      });
    }
  }
);

/**
 * GET /api/account/stats
 * Get account statistics
 */
router.get('/stats',
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await query(
        `SELECT 
          COUNT(*) as total_notes,
          COUNT(CASE WHEN is_pinned THEN 1 END) as pinned_notes,
          COUNT(DISTINCT category) as unique_categories,
          MIN(created_at) as oldest_note,
          MAX(created_at) as newest_note
         FROM notes
         WHERE user_id = $1`,
        [userId]
      );

      const stats = result.rows[0];

      res.json({
        totalNotes: parseInt(stats.total_notes),
        pinnedNotes: parseInt(stats.pinned_notes),
        uniqueCategories: parseInt(stats.unique_categories),
        oldestNote: stats.oldest_note,
        newestNote: stats.newest_note
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({
        error: 'Failed to get statistics',
        message: 'An error occurred while fetching statistics'
      });
    }
  }
);

/**
 * PATCH /api/account/profile
 * Update user profile (username or email)
 */
router.patch('/profile',
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { username, email } = req.body;

      // Validate at least one field to update
      if (!username && !email) {
        return res.status(400).json({
          error: 'No fields to update',
          message: 'Please provide username or email to update'
        });
      }

      const updates = [];
      const values = [];
      let paramCount = 0;

      // Check and add username update
      if (username) {
        // Validate username format
        if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
          return res.status(400).json({
            error: 'Invalid username',
            message: 'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'
          });
        }

        // Check if username is taken
        const usernameCheck = await query(
          'SELECT id FROM users WHERE username = $1 AND id != $2',
          [username, userId]
        );

        if (usernameCheck.rows.length > 0) {
          return res.status(409).json({
            error: 'Username taken',
            message: 'This username is already taken'
          });
        }

        paramCount++;
        updates.push(`username = $${paramCount}`);
        values.push(username);
      }

      // Check and add email update
      if (email) {
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).json({
            error: 'Invalid email',
            message: 'Please provide a valid email address'
          });
        }

        // Check if email is taken
        const emailCheck = await query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email.toLowerCase(), userId]
        );

        if (emailCheck.rows.length > 0) {
          return res.status(409).json({
            error: 'Email taken',
            message: 'This email is already registered'
          });
        }

        paramCount++;
        updates.push(`email = $${paramCount}`);
        values.push(email.toLowerCase());
      }

      // Add user ID as final parameter
      paramCount++;
      values.push(userId);

      // Execute update
      const result = await query(
        `UPDATE users 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount}
         RETURNING id, username, email, updated_at`,
        values
      );

      res.json({
        message: 'Profile updated successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        error: 'Update failed',
        message: 'An error occurred while updating your profile'
      });
    }
  }
);

export default router;
