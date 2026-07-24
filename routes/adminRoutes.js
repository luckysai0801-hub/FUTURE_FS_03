// =============================================
// routes/adminRoutes.js
// Handles Society Manager Admin panel REST API endpoints
// Skyline Residency – Smart Apartment Portal
// =============================================

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/roleMiddleware');

// GET /api/admin/dashboard - Admin Dashboard stats & data
router.get('/dashboard', isAdmin, adminController.dashboard);

// GET /api/admin/complaints - List & filter apartment complaints
router.get('/complaints', isAdmin, adminController.listComplaints);

// GET /api/admin/complaints/:id - View single complaint & timeline
router.get('/complaints/:id', isAdmin, adminController.complaintDetail);

// POST /api/admin/complaints/:id/status - Update complaint status
router.post('/complaints/:id/status', isAdmin, adminController.updateStatus);

// POST /api/admin/complaints/:id/details - Update assigned staff & remarks
router.post('/complaints/:id/details', isAdmin, adminController.updateDetails);

// POST & DELETE /api/admin/complaints/:id/delete - Delete complaint
router.post('/complaints/:id/delete', isAdmin, adminController.deleteComplaint);
router.delete('/complaints/:id', isAdmin, adminController.deleteComplaint);

// GET /api/admin/announcements - Manage announcements
router.get('/announcements', isAdmin, adminController.listAnnouncements);

// POST /api/admin/announcements - Create new announcement
router.post('/announcements', isAdmin, adminController.createAnnouncement);

// POST & DELETE /api/admin/announcements/:id/delete - Delete announcement
router.post('/announcements/:id/delete', isAdmin, adminController.deleteAnnouncement);
router.delete('/announcements/:id', isAdmin, adminController.deleteAnnouncement);

// GET /api/admin/users - Resident directory
router.get('/users', isAdmin, adminController.listUsers);

// GET /admin/export/csv - Stream CSV file download
router.get('/export/csv', isAdmin, adminController.exportCSV);

// GET /api/admin/export/pdf-data - Return JSON data for PDF report page
router.get('/export/pdf-data', isAdmin, adminController.exportPDFData);

// GET /api/admin/reports - Analytics & reports metrics
router.get('/reports', isAdmin, adminController.reports);

module.exports = router;
