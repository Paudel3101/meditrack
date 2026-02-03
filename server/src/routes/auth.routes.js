const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authValidators } = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.post('/login', authValidators.login, authController.login);
router.post('/register', authValidators.register, authController.register);

// Protected routes
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);
router.put('/password', authMiddleware.verifyToken, authController.updatePassword);
router.post('/logout', authMiddleware.verifyToken, authController.logout);

module.exports = router;
