const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { patientValidators } = require('../middleware/validate.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkSession);

// Public patient routes (accessible by all staff)
router.get('/', authMiddleware.isStaff, patientController.getPatients);
router.get('/search', authMiddleware.isStaff, patientController.searchPatients);
router.get('/:id', authMiddleware.isStaff, patientController.getPatientById);

// Patient management routes
router.post('/', 
  authMiddleware.checkRole(['Admin', 'Doctor', 'Receptionist']),
  patientValidators.create,
  patientController.createPatient
);

router.put('/:id',
  authMiddleware.checkRole(['Admin', 'Doctor', 'Receptionist']),
  patientValidators.update,
  patientController.updatePatient
);

router.put('/:id/archive',
  authMiddleware.checkRole(['Admin']),
  patientController.archivePatient
);

router.put('/:id/unarchive',
  authMiddleware.checkRole(['Admin']),
  patientController.unarchivePatient
);

module.exports = router;
