// =============================================
// routes/complaintRoutes.js
// Handles Public Complaint Submission, Tracking & Announcements REST API
// Skyline Residency – Smart Apartment Portal
// =============================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const complaintController = require('../controllers/complaintController');
const upload = require('../middleware/uploadMiddleware');

// POST /api/complaints - Submit public complaint (with optional image upload & error handling)
router.post('/complaints', (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, error: `Image upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    });
}, complaintController.createComplaint);

// GET /api/complaints/track - Track complaint search by Complaint ID
router.get('/complaints/track', complaintController.trackComplaint);

// GET /api/announcements - Public notice board feed
router.get('/announcements', complaintController.getAnnouncements);

module.exports = router;
