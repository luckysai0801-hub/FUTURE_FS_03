// =============================================
// routes/authRoutes.js
// Handles Admin Authentication & Session Check API
// Skyline Residency – Smart Apartment Portal
// =============================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GET /api/auth/check - Check admin session status
router.get('/check', authController.checkAuth);

// POST /api/auth/login - Handle admin login
router.post('/login', authController.adminLogin);

// GET & POST /api/auth/logout - Logout admin session
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
