// =============================================
// routes/authRoutes.js
// Handles Admin Authentication (Society Manager) & Logout
// Skyline Residency – Smart Apartment Portal
// =============================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GET /admin/login - Show admin login form
router.get('/admin/login', authController.showAdminLogin);

// POST /admin/login - Handle admin login
router.post('/admin/login', authController.adminLogin);

// GET /logout - Logout admin session
router.get('/logout', authController.logout);

module.exports = router;
