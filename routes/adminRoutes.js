// =============================================
// routes/adminRoutes.js
// Handles Society Manager Admin panel routes
// Skyline Residency – Smart Apartment Portal
// =============================================

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/roleMiddleware');

// GET /admin/dashboard - Admin Dashboard with stats
router.get('/dashboard', isAdmin, adminController.dashboard);

// GET /admin/complaints - List all apartment complaints
router.get('/complaints', isAdmin, adminController.listComplaints);

// GET /admin/complaints/:id - View complaint details & update status
router.get('/complaints/:id', isAdmin, adminController.complaintDetail);

// POST /admin/complaints/:id/update-status - Update complaint status
router.post('/complaints/:id/update-status', isAdmin, adminController.updateStatus);

// POST /admin/complaints/:id/update-details - Update complaint details (assign staff, remarks)
router.post('/complaints/:id/update-details', isAdmin, adminController.updateDetails);

// POST /admin/complaints/:id/delete - Delete a complaint record
router.post('/complaints/:id/delete', isAdmin, adminController.deleteComplaint);

// GET /admin/announcements - Manage announcements
router.get('/announcements', isAdmin, adminController.listAnnouncements);

// POST /admin/announcements - Create a new announcement
router.post('/announcements', isAdmin, adminController.createAnnouncement);

// POST /admin/announcements/:id/delete - Delete announcement
router.post('/announcements/:id/delete', isAdmin, adminController.deleteAnnouncement);

// GET /admin/users - Manage resident directory
router.get('/users', isAdmin, adminController.listUsers);

// GET /admin/export/csv - Download CSV report
router.get('/export/csv', isAdmin, adminController.exportCSV);

// GET /admin/export/pdf - Print-ready PDF report
router.get('/export/pdf', isAdmin, adminController.exportPDF);

// GET /admin/reports - Analytics & reports page
router.get('/reports', isAdmin, adminController.reports);

module.exports = router;
