const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const { sendError } = require('../utils/responseHandler');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return sendError(res, 'Missing authorization header', 401);
  }
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
