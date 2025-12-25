const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const { sendError } = require('../utils/responseHandler');

/**
 * Authentication middleware - Validates JWT tokens
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if authorization header exists
  if (!authHeader) {
    return sendError(res, 'Missing authorization header', 401);
  }

  // Check if token format is correct (Bearer <token>)
  if (!authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Invalid authorization format', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired', 401);
    }
    return sendError(res, 'Invalid token', 401);
  }
};

module.exports = authMiddleware;
