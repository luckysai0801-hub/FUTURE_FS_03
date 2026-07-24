// =============================================
// server.js - Main Entry Point
// Skyline Residency – Smart Apartment Complaint & Maintenance Portal
// Decoupled Client-Server Architecture (Pure HTML/CSS/JS + Express REST APIs)
// =============================================

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import API routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { isAdmin } = require('./middleware/roleMiddleware');
const adminController = require('./controllers/adminController');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static assets from public directory with multi-route fallback
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public')));
app.use('/complaints', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'pages')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware (used exclusively for Admin authentication)
app.use(session({
    secret: process.env.SESSION_SECRET || 'skyline_residency_secret_key_2026_smart_apartment',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api', complaintRoutes);
app.use('/api/admin', adminRoutes);

// Direct CSV Download routes
app.get('/admin/export/csv', isAdmin, adminController.exportCSV);
app.get('/api/admin/export/csv', isAdmin, adminController.exportCSV);

// Static Page Routes (Support both clean URLs and .html extensions)
app.get(['/', '/index', '/index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/index.html'));
});

app.get(['/complaint', '/complaint.html', '/complaints/new'], (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/complaint.html'));
});

app.get(['/track', '/track.html', '/complaints'], (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/track.html'));
});

app.get(['/announcements', '/announcements.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/announcements.html'));
});

app.get(['/contact', '/contact.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/contact.html'));
});

app.get(['/admin/login', '/admin-login', '/admin-login.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/admin-login.html'));
});

app.get(['/admin/dashboard', '/dashboard', '/dashboard.html', '/admin'], (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/dashboard.html'));
});

app.get(['/admin/complaints', '/admin-complaints', '/admin-complaints.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/admin-complaints.html'));
});

app.get(['/admin/announcements', '/admin-announcements', '/admin-announcements.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/admin-announcements.html'));
});

app.get(['/admin/users', '/admin-users', '/admin-users.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/admin-users.html'));
});

app.get(['/admin/reports', '/admin-reports', '/admin-reports.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/admin-reports.html'));
});

// Alias routes
app.get('/complaints', (req, res) => res.redirect('/track'));
app.get('/admin', (req, res) => res.redirect('/admin/dashboard'));

// 404 Handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'pages/404.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Unhandled Error:', err.stack);
    res.status(500).sendFile(path.join(__dirname, 'pages/404.html'));
});

// Start Server
app.listen(PORT, () => {
    fs.writeFileSync(path.join(__dirname, 'running.txt'), `Server started on port ${PORT}`);
    console.log('');
    console.log('🚀 ================================================');
    console.log(`   Skyline Residency – Public Portal & Admin`);
    console.log(`   Server running at http://localhost:${PORT}`);
    console.log('   ================================================');
    console.log('');
    console.log('📌 Available URLs:');
    console.log(`   🏠  Home               : http://localhost:${PORT}/`);
    console.log(`   📝  Register Complaint : http://localhost:${PORT}/complaint.html`);
    console.log(`   🔍  Track Complaint    : http://localhost:${PORT}/track.html`);
    console.log(`   🛡️  Admin Login        : http://localhost:${PORT}/admin-login.html`);
    console.log('');
});
