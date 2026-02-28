/**
 * Authentication Routes
 * Handles user registration, login, and token management
 */

import express from 'express';
import requestValidator from 'express-request-validator';
import {
  authRateLimiter,
  registrationRateLimiter
} from '../middleware/rateLimiter.js';
import {
  getCurrentUser,
  loginUser,
  refreshUserToken,
  registerUser
} from '../services/auth-service.js';

const { validate } = requestValidator;

const router = express.Router();

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
      const response = await registerUser(req.body);
      res.status(201).json(response);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.error || 'Registration failed',
        message: error.message || 'An error occurred during registration. Please try again.'
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
      const response = await loginUser(req.body);
      res.json(response);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.error || 'Login failed',
        message: error.message || 'An error occurred during login. Please try again.'
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
    const response = await refreshUserToken(req.body);
    res.json(response);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.error || 'Token refresh failed',
      message: error.message || 'An error occurred while refreshing the token'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', async (req, res) => {
  try {
    const response = await getCurrentUser(req.headers.authorization);
    res.json(response);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.error || 'Failed to get user',
      message: error.message || 'An error occurred while fetching user information'
    });
  }
});

export default router;
