const jwt = require('jsonwebtoken');
const db = require('../utils/db');

const authMiddleware = {
  // Verify JWT token
  verifyToken: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }
  },

  // Check if user is admin
  isAdmin: (req, res, next) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  },

  // Check if user is staff (Doctor, Nurse, or Admin)
  isStaff: (req, res, next) => {
    const allowedRoles = ['Doctor', 'Nurse', 'Admin', 'Receptionist'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff privileges required.'
      });
    }
    next();
  },

  // Role-based access control
  checkRole: (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(', ')}`
        });
      }
      next();
    };
  },

  // Session timeout check
  checkSession: async (req, res, next) => {
    try {
      // Check if user is still active in database
      const [user] = await db.query(
        'SELECT is_active FROM staff WHERE id = ?',
        [req.user.id]
      );

      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Session expired or user deactivated.'
        });
      }

      // Update last activity timestamp (optional)
      next();
    } catch (error) {
      console.error('Session check error:', error);
      next(error);
    }
  }
};

module.exports = authMiddleware;
