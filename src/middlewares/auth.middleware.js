const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');
const { ROLES } = require('../constants');

exports.requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return sendResponse(res, 401, 'Authentication required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendResponse(res, 401, 'User no longer exists or session invalid');
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    return sendResponse(res, 401, 'Invalid or expired token');
  }
});

exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === ROLES.ADMIN) {
    next();
  } else {
    return sendResponse(res, 403, 'Admin access required');
  }
};

exports.optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = await User.findById(decoded.userId);
    } catch (err) {}
  }
  next();
});
