/**
 * User Account Routes
 * Handles account management: deletion, data export, profile updates
 */

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { deleteAccountRateLimiter } from '../middleware/rateLimiter.js';
import {
  deleteAccount,
  exportAccountData,
  getAccountStats,
  updateAccountProfile
} from '../services/account-service.js';

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
      const response = await deleteAccount(userId, deleteNotes);
      res.json(response);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.error || 'Account deletion failed',
        message: error.message || 'An error occurred while deleting your account. Please try again.'
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
      const exportData = await exportAccountData(userId);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="mini-notes-data-export-${Date.now()}.json"`);
      res.json(exportData);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.error || 'Export failed',
        message: error.message || 'An error occurred while exporting your data. Please try again.'
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
      const stats = await getAccountStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.error || 'Failed to get statistics',
        message: error.message || 'An error occurred while fetching statistics'
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
      const user = await updateAccountProfile(userId, req.body);

      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.error || 'Update failed',
        message: error.message || 'An error occurred while updating your profile'
      });
    }
  }
);

export default router;
