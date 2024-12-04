const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Register a user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Reset password (by phone number)
router.post('/reset-password', authController.resetPassword);

// Update password (authenticated)
router.post('/update-password', authController.verifyToken, authController.updatePassword);

// Get user details (authenticated)
router.get('/me', authController.verifyToken, authController.getUserDetails);

// Update user location (authenticated)
router.post('/update-location', authController.verifyToken, authController.updateLocation);

// Set user online status (authenticated)
router.patch('/driver/set-status/:id', authController.verifyToken, authController.switchStatus);

// Get all drivers
router.get('/get-drivers', authController.getAllDrivers);

module.exports = router;
