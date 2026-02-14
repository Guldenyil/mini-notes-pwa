/**
 * Authentication Routes
 * Handles user registration, login, and token management
 */

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import requestValidator from 'express-request-validator';
import { query } from '../db/connection.js';
import { generateTokens, JWT_SECRET, verifyToken } from '../middleware/auth.js';
import {
  authRateLimiter,
  registrationRateLimiter
} from '../middleware/rateLimiter.js';

const { validate } = requestValidator;

const router = express.Router();

// Current ToS version - increment when ToS changes
const CURRENT_TOS_VERSION = '1.0.0';

/**
 * Validation schemas for auth endpoints
 */
const schemas = {
  register: {
    username: {
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_-]+$/,
      messages: {
        pattern: 'Username can only contain letters, numbers, underscores, and hyphens'
      }
    },
    email: {
      type: 'string',
      required: true,
      maxLength: 255,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      messages: {
        pattern: 'Please provide a valid email address'
      }
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8,
      maxLength: 100,
      messages: {
        minLength: 'Password must be at least 8 characters'
      }
    },
    tosAccepted: {
      type: 'boolean',
      required: true,
      equals: true,
      messages: {
        equals: 'You must accept the Terms of Service to register'
      }
    }
  },
  login: {
    email: {
      type: 'string',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      type: 'string',
      required: true
    }
  }
};

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', 
  registrationRateLimiter,
  validate(schemas.register, { source: 'body' }),
  async (req, res) => {
    try {
      const { username, email, password, tosAccepted } = req.body;

      // Verify ToS acceptance (double-check even though validation enforces it)
      if (!tosAccepted) {
        return res.status(400).json({
          error: 'Terms of Service not accepted',
          message: 'You must accept the Terms of Service to create an account'
        });
      }

      // Check if email already exists
      const emailCheck = await query(
        'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
        [email.toLowerCase()]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          error: 'Email already registered',
          message: 'An account with this email already exists'
        });
      }

      // Check if username already exists
      const usernameCheck = await query(
        'SELECT id FROM users WHERE username = $1 AND deleted_at IS NULL',
        [username]
      );

      if (usernameCheck.rows.length > 0) {
        return res.status(409).json({
          error: 'Username already taken',
          message: 'This username is already taken. Please choose another.'
        });
      }

      // Hash password with bcrypt (cost factor 12)
      const passwordHash = await bcrypt.hash(password, 12);

      // Insert new user
      const result = await query(
        `INSERT INTO users (username, email, password_hash, tos_accepted_at, tos_version_accepted)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
         RETURNING id, username, email, tos_accepted_at, tos_version_accepted, created_at`,
        [username, email.toLowerCase(), passwordHash, CURRENT_TOS_VERSION]
      );

      const user = result.rows[0];

      // Generate JWT tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Return success with tokens
      res.status(201).json({
        message: 'Account created successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          tosVersionAccepted: user.tos_version_accepted,
          createdAt: user.created_at
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Registration failed',
        message: 'An error occurred during registration. Please try again.'
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login',
  authRateLimiter,
  validate(schemas.login, { source: 'body' }),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const result = await query(
        `SELECT id, username, email, password_hash, tos_version_accepted, created_at
         FROM users 
         WHERE email = $1 AND deleted_at IS NULL`,
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        // User not found - use generic message for security
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      const user = result.rows[0];

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.password_hash);

      if (!passwordValid) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Check if user needs to re-accept updated ToS
      const needsTosUpdate = user.tos_version_accepted !== CURRENT_TOS_VERSION;

      // Generate JWT tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Return success
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          tosVersionAccepted: user.tos_version_accepted,
          needsTosUpdate,
          createdAt: user.created_at
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login failed',
        message: 'An error occurred during login. Please try again.'
      });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        message: 'Please provide a refresh token'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or expired'
      });
    }

    // Get user from database
    const result = await query(
      'SELECT id, username, email FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }

    const user = result.rows[0];

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      message: 'Token refreshed successfully',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'An error occurred while refreshing the token'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid access token'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Access token is invalid or expired'
      });
    }

    // Get user from database
    const result = await query(
      `SELECT id, username, email, tos_version_accepted, created_at
       FROM users 
       WHERE id = $1 AND deleted_at IS NULL`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        tosVersionAccepted: user.tos_version_accepted,
        needsTosUpdate: user.tos_version_accepted !== CURRENT_TOS_VERSION,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: 'An error occurred while fetching user information'
    });
  }
});

export default router;
