const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { appointmentValidators } = require('../middleware/validate.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkSession);

// Appointment routes
router.get('/', authMiddleware.isStaff, appointmentController.getAppointments);
router.get('/:id', authMiddleware.isStaff, appointmentController.getAppointmentById);

router.post('/',
  authMiddleware.checkRole(['Admin', 'Doctor', 'Receptionist']),
  appointmentValidators.create,
  appointmentController.createAppointment
);

router.put('/:id',
  authMiddleware.checkRole(['Admin', 'Doctor', 'Receptionist']),
  appointmentController.updateAppointment
);

router.put('/:id/status',
  authMiddleware.checkRole(['Admin', 'Doctor', 'Nurse', 'Receptionist']),
  appointmentValidators.updateStatus,
  appointmentController.updateAppointmentStatus
);

router.delete('/:id',
  authMiddleware.checkRole(['Admin', 'Receptionist']),
  appointmentController.deleteAppointment
);

module.exports = router;
