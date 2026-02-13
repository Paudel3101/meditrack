const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkSession);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard statistics
 *     description: Retrieve overall clinic statistics including patient and appointment counts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_patients:
 *                       type: integer
 *                     total_appointments:
 *                       type: integer
 *                     total_staff:
 *                       type: integer
 *                     appointments_today:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', authMiddleware.isStaff, dashboardController.getStats);

/**
 * @swagger
 * /api/dashboard/recent-appointments:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get recent appointments
 *     description: Retrieve the most recent appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent appointments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/recent-appointments', authMiddleware.isStaff, dashboardController.getRecentAppointments);

/**
 * @swagger
 * /api/dashboard/patient-count:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get patient count
 *     description: Retrieve the total count of active patients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient count retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                     archived:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/patient-count', authMiddleware.isStaff, dashboardController.getPatientCount);

module.exports = router;
