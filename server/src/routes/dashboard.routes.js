const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkSession);

// Dashboard routes
router.get('/stats', authMiddleware.isStaff, dashboardController.getStats);
router.get('/recent-appointments', authMiddleware.isStaff, dashboardController.getRecentAppointments);
router.get('/patient-count', authMiddleware.isStaff, dashboardController.getPatientCount);

module.exports = router;
