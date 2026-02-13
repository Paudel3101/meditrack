const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authValidators } = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login staff member
 *     description: Authenticate a staff member and receive a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Invalid input/validation error
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post('/login', authValidators.login, authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register new staff member
 *     description: Create a new staff account with secure password hashing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: integer
 *       400:
 *         description: Invalid input or email already exists
 *       500:
 *         description: Server error
 */
router.post('/register', authValidators.register, authController.register);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user profile
 *     description: Retrieve the profile of the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);

/**
 * @swagger
 * /api/auth/password:
 *   put:
 *     tags:
 *       - Authentication
 *     summary: Update password
 *     description: Change the password for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - old_password
 *               - new_password
 *             properties:
 *               old_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid input or incorrect old password
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */
router.put('/password', authMiddleware.verifyToken, authController.updatePassword);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Logout the current authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */
router.post('/logout', authMiddleware.verifyToken, authController.logout);

module.exports = router;
