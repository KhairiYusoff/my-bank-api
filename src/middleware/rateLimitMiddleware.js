const rateLimit = require('express-rate-limit');

// What is Rate Limiting?
// Rate limiting controls how many requests a client can make in a specific time period
// This prevents abuse, protects your server from overload, and stops brute force attacks

// Development-friendly rate limiter - very generous limits
const devRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 1000, // Allow 1000 requests per hour per IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true, // Send rate limit info in headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Production-ready rate limiter - much stricter
const prodRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow 100 requests per 15 minutes per IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for sensitive endpoints (login, register)
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

// Choose which rate limiter to use based on environment
const rateLimitMiddleware = process.env.NODE_ENV === 'production' 
  ? prodRateLimit 
  : devRateLimit;

module.exports = {
  rateLimitMiddleware,
  authRateLimit
};
