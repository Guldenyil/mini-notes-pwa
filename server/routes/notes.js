/**
 * Notes Routes
 * Keeps note-related API handlers separate from server bootstrap.
 */

import express from 'express';
import requestValidator from 'express-request-validator';
import { query } from '../db/connection.js';
import {
  createNoteSchema,
  updateNoteSchema,
  noteIdSchema,
  noteQuerySchema
} from '../schemas/note.js';
import { requireAuth } from '../middleware/auth.js';
import { scopeToUser, authorizeNoteAccess } from '../middleware/authorize.js';

const { validate } = requestValidator;
const router = express.Router();

router.get(
  '/',
  requireAuth,
  scopeToUser,
  validate(noteQuerySchema, { source: 'query', strict: false }),
  async (req, res) => {
    try {
      const { category, isPinned, search, sortBy, order } = req.query;
      const userId = req.scopedUserId;

      let queryText = 'SELECT * FROM notes WHERE user_id = $1';
      const params = [userId];
      let paramCount = 1;

      if (category) {
        paramCount++;
        queryText += ` AND LOWER(category) = LOWER($${paramCount})`;
        params.push(category);
      }

      if (isPinned !== undefined) {
        paramCount++;
        queryText += ` AND is_pinned = $${paramCount}`;
        params.push(isPinned === 'true');
      }

      if (search) {
        paramCount++;
        queryText += ` AND (title ILIKE $${paramCount} OR content ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      const validSortFields = ['title', 'created_at', 'updated_at'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
      const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
      queryText += ` ORDER BY ${sortField} ${sortOrder}`;

      const result = await query(queryText, params);

      res.json({
        success: true,
        data: result.rows.map((row) => ({
          id: row.id,
          title: row.title,
          content: row.content,
          category: row.category,
          color: row.color,
          isPinned: row.is_pinned,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })),
        count: result.rows.length
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve notes'
      });
    }
  }
);

router.get(
  '/:id',
  requireAuth,
  authorizeNoteAccess,
  validate(noteIdSchema, { source: 'params' }),
  async (req, res) => {
    try {
      const noteId = req.params.id;
      const result = await query('SELECT * FROM notes WHERE id = $1', [noteId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Note not found'
        });
      }

      const row = result.rows[0];
      res.json({
        success: true,
        data: {
          id: row.id,
          title: row.title,
          content: row.content,
          category: row.category,
          color: row.color,
          isPinned: row.is_pinned,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }
      });
    } catch (error) {
      console.error('Error fetching note:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve note'
      });
    }
  }
);

router.post(
  '/',
  requireAuth,
  validate(createNoteSchema),
  async (req, res) => {
    try {
      const { title, content, category, color, isPinned } = req.body;
      const userId = req.user.id;

      const result = await query(
        `INSERT INTO notes (user_id, title, content, category, color, is_pinned)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, title, content, category || null, color || null, isPinned || false]
      );

      const row = result.rows[0];
      res.status(201).json({
        success: true,
        data: {
          id: row.id,
          title: row.title,
          content: row.content,
          category: row.category,
          color: row.color,
          isPinned: row.is_pinned,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        },
        message: 'Note created successfully'
      });
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create note'
      });
    }
  }
);

router.put(
  '/:id',
  requireAuth,
  authorizeNoteAccess,
  validate(noteIdSchema, { source: 'params' }),
  validate(updateNoteSchema, { partial: true }),
  async (req, res) => {
    try {
      const noteId = req.params.id;
      const { title, content, category, color, isPinned } = req.body;

      const updates = [];
      const params = [];
      let paramCount = 0;

      if (title !== undefined) {
        paramCount++;
        updates.push(`title = $${paramCount}`);
        params.push(title);
      }
      if (content !== undefined) {
        paramCount++;
        updates.push(`content = $${paramCount}`);
        params.push(content);
      }
      if (category !== undefined) {
        paramCount++;
        updates.push(`category = $${paramCount}`);
        params.push(category);
      }
      if (color !== undefined) {
        paramCount++;
        updates.push(`color = $${paramCount}`);
        params.push(color);
      }
      if (isPinned !== undefined) {
        paramCount++;
        updates.push(`is_pinned = $${paramCount}`);
        params.push(isPinned);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      paramCount++;
      params.push(noteId);

      const result = await query(
        `UPDATE notes SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount}
         RETURNING *`,
        params
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Note not found'
        });
      }

      const row = result.rows[0];
      res.json({
        success: true,
        data: {
          id: row.id,
          title: row.title,
          content: row.content,
          category: row.category,
          color: row.color,
          isPinned: row.is_pinned,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        },
        message: 'Note updated successfully'
      });
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update note'
      });
    }
  }
);

router.delete(
  '/:id',
  requireAuth,
  authorizeNoteAccess,
  validate(noteIdSchema, { source: 'params' }),
  async (req, res) => {
    try {
      const noteId = req.params.id;
      const result = await query('DELETE FROM notes WHERE id = $1 RETURNING id', [noteId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Note not found'
        });
      }

      res.json({
        success: true,
        message: 'Note deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete note'
      });
    }
  }
);

export default router;
