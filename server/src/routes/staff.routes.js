const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { staffValidators } = require('../middleware/validate.middleware');

// All staff routes require authentication
router.use(authMiddleware.verifyToken);

// Get all staff (Admin and Receptionist)
router.get(
  '/',
  authMiddleware.checkRole(['Admin', 'Receptionist']),
  staffController.getStaff
);

// Get staff by ID (Admin and Receptionist)
router.get(
  '/:id',
  authMiddleware.checkRole(['Admin', 'Receptionist']),
  staffController.getStaffById
);

// Create new staff (Admin only)
router.post(
  '/',
  authMiddleware.isAdmin,
  staffValidators.create,
  staffController.createStaff
);

// Update staff (Admin only)
router.put(
  '/:id',
  authMiddleware.isAdmin,
  staffValidators.update,
  staffController.updateStaff
);

// Deactivate staff (Admin only)
router.put(
  '/:id/deactivate',
  authMiddleware.isAdmin,
  staffController.deactivateStaff
);

// Reactivate staff (Admin only)
router.put(
  '/:id/reactivate',
  authMiddleware.isAdmin,
  staffController.reactivateStaff
);

module.exports = router;
