/**
 * Authentication Middleware
 * 
 * Follows separation of concerns:
 * - auth.js: Verifies WHO the user is (authentication)
 * - authorize.js: Verifies WHAT they can access (authorization)
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate access and refresh tokens for a user
 * @param {Object} user - User object with id, email, username
 * @returns {Object} - { accessToken, refreshToken }
 */
function generateTokens(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    username: user.username
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'mini-notes-api',
    audience: 'mini-notes-client'
  });

  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'mini-notes-api',
      audience: 'mini-notes-client'
    }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'mini-notes-api',
      audience: 'mini-notes-client'
    });
  } catch (error) {
    return null;
  }
}

/**
 * Authentication middleware - Verifies user identity
 * Extracts JWT from Authorization header and validates it
 * Attaches user info to req.user if valid
 * 
 * Does NOT enforce authentication - just identifies the user
 * Use requireAuth() to enforce authentication
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided - continue without user context
    req.user = null;
    return next();
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const decoded = verifyToken(token);

  if (!decoded) {
    // Invalid token - continue without user context
    req.user = null;
    return next();
  }

  // Valid token - attach user to request
  req.user = {
    id: decoded.userId,
    email: decoded.email,
    username: decoded.username
  };

  next();
}

/**
 * Require authentication middleware
 * Must be used after authenticate() middleware
 * Returns 401 if user is not authenticated
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  next();
}

/**
 * Optional authentication middleware
 * Similar to authenticate() but more explicit in naming
 * Use when authentication is optional but useful
 */
function optionalAuth(req, res, next) {
  return authenticate(req, res, next);
}

module.exports = {
  generateTokens,
  verifyToken,
  authenticate,
  requireAuth,
  optionalAuth,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
