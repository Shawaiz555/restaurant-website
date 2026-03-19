const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

// All roles that are considered "staff" (non-regular users)
const STAFF_ROLES = ['super_admin', 'manager', 'employee', 'chef'];

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyAccessToken(token);

      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Contact a Super Admin.'
        });
      }

      // Update lastActive timestamp (non-blocking)
      User.findByIdAndUpdate(req.user._id, { lastActive: new Date() }).exec();

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in auth middleware'
    });
  }
};

// Flexible role-based authorization — pass one or more allowed roles
// Usage: authorize('super_admin', 'manager')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Backward-compatible alias — any staff role passes (replaces old adminOnly checks)
const adminOnly = (req, res, next) => {
  if (req.user && STAFF_ROLES.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Staff only.'
  });
};

// Optional auth — attaches user if token present, continues as guest if not
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.userId).select('-password');
      if (req.user && req.user.isActive) {
        User.findByIdAndUpdate(req.user._id, { lastActive: new Date() }).exec();
      }
    } catch {
      // Invalid token — continue as guest
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = { protect, adminOnly, authorize, optionalAuth, STAFF_ROLES };
