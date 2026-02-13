/**
 * Authentication Middleware
 * 
 * Handles JWT token verification, role-based access control (RBAC),
 * and session management for protected routes.
 * 
 * Features:
 * - JWT token extraction from Authorization header (Bearer token)
 * - Token signature verification and expiration checking
 * - Role-based access control with role whitelisting
 * - Session validation against database to support immediate logout
 */

const jwt = require('jsonwebtoken');
const db = require('../utils/db');

const authMiddleware = {
  /**
   * Verify JWT token middleware
   * 
   * Extracts JWT from Authorization header, verifies signature and expiration,
   * and attaches decoded user information to req.user
   * 
   * Expected header format: Authorization: Bearer <jwt_token>
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @throws {401} No token provided or invalid/expired token
   */
  verifyToken: (req, res, next) => {
    // Extract token from "Authorization: Bearer <token>" header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token signature and expiration
      // jwt.verify throws error if signature is invalid or token is expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach decoded user information to request object
      // Available in controllers as req.user
      req.user = decoded;
      next();
    } catch (error) {
      // Generic error message for security (doesn't reveal why token failed)
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }
  },

  /**
   * Check if user has Admin role
   * 
   * Restricts endpoint access to Admin role only.
   * Use after verifyToken middleware.
   * 
   * @param {Object} req - Express request object (with req.user from verifyToken)
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @throws {403} User role is not Admin
   */
  isAdmin: (req, res, next) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  },

  /**
   * Check if user is a staff member
   * 
   * Allows access to users with staff roles (Doctor, Nurse, Receptionist, Admin).
   * Use after verifyToken middleware.
   * 
   * @param {Object} req - Express request object (with req.user from verifyToken)
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @throws {403} User role is not in staff list
   */
  isStaff: (req, res, next) => {
    // Define allowed roles for staff access
    const allowedRoles = ['Doctor', 'Nurse', 'Admin', 'Receptionist'];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff privileges required.'
      });
    }
    next();
  },

  /**
   * Role-based access control (RBAC) middleware factory
   * 
   * Creates middleware that checks if user's role is in the allowed roles list.
   * Returns a middleware function that performs the check.
   * 
   * Usage:
   *   router.get('/:id', authMiddleware.checkRole(['Admin', 'Doctor']), controller.handle)
   * 
   * @param {Array<string>} roles - Array of allowed roles
   * @returns {Function} Middleware function that validates user role
   * @throws {403} User role not in allowedRoles array
   */
  checkRole: (roles) => {
    return (req, res, next) => {
      // Check if user's role is in the allowed roles list
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(', ')}`
        });
      }
      next();
    };
  },

  /**
   * Session validation middleware
   * 
   * Verifies that the authenticated user still exists in the database
   * and is marked as active. This enables:
   * - Immediate logout effect (deactivated users cannot access protected routes)
   * - Detection of deleted/disabled accounts
   * - Session state validation against database
   * 
   * Note: This middleware should be placed after verifyToken
   * and may impact performance on every request due to database query.
   * Consider caching with TTL for production optimization.
   * 
   * @param {Object} req - Express request object (with req.user from verifyToken)
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @throws {401} User not found or marked as inactive
   */
  checkSession: async (req, res, next) => {
    try {
      // Query database to verify user still exists and is active
      const [user] = await db.query(
        'SELECT is_active FROM staff WHERE id = ?',
        [req.user.id]
      );

      // Check if user exists and is marked active
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Session expired or user deactivated.'
        });
      }

      // User is valid, proceed to next middleware/controller
      next();
    } catch (error) {
      console.error('Session check error:', error);
      // Pass error to error handling middleware
      next(error);
    }
  }
};

module.exports = authMiddleware;
