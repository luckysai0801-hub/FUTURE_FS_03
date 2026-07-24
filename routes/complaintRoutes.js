// =============================================
// routes/complaintRoutes.js
// Handles Public Complaint Submission, Tracking & Notices
// Skyline Residency – Smart Apartment Portal
// =============================================

const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const upload = require('../middleware/uploadMiddleware');

// GET /complaints/new - Show public complaint registration form
router.get('/complaints/new', complaintController.showNewComplaint);

// POST /complaints - Submit public complaint (with optional image upload)
router.post('/complaints', upload.single('image'), complaintController.createComplaint);

// GET /track - Show public complaint tracking search page
router.get('/track', complaintController.showTrack);

// POST /track - Perform public complaint search by Complaint ID
router.post('/track', complaintController.searchTrack);

// GET /announcements - Public notice board
router.get('/announcements', complaintController.showAnnouncements);

// Alias /complaints -> /track
router.get('/complaints', (req, res) => res.redirect('/track'));

module.exports = router;
