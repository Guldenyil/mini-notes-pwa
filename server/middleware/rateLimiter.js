/**
 * Rate Limiting Middleware
 * 
 * Protects against brute force attacks and abuse
 * Uses in-memory store (suitable for single-server deployments)
 * For production with multiple servers, use Redis
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication endpoints
 * 10 attempts per 15 minutes per IP (relaxed for development)
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    error: 'Too many attempts',
    message: 'Too many login attempts. Please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  // Use IP + email for more granular limiting
  keyGenerator: (req) => {
    const email = req.body?.email || '';
    return `${req.ip}-${email}`;
  }
});

/**
 * Rate limiter for registration endpoint
 * 10 attempts per hour per IP (relaxed for development)
 */
const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per window
  message: {
    error: 'Too many registration attempts',
    message: 'Too many registration attempts. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for general API endpoints
 * 100 requests per minute per user/IP
 */
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests',
    message: 'API rate limit exceeded. Please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID if authenticated, otherwise IP
  keyGenerator: (req) => {
    return req.user?.id?.toString() || req.ip;
  }
});

/**
 * Rate limiter for account deletion
 * Very restrictive to prevent accidental deletions
 * 1 attempt per hour per user
 */
const deleteAccountRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // 1 request per window
  message: {
    error: 'Account deletion cooldown',
    message: 'You can only attempt account deletion once per hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id?.toString() || req.ip;
  }
});

module.exports = {
  authRateLimiter,
  registrationRateLimiter,
  apiRateLimiter,
  deleteAccountRateLimiter
};
