// =============================================
// server.js - Main Entry Point
// Skyline Residency – Smart Apartment Complaint & Maintenance Portal
// =============================================

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// View Engine - EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
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

// Global template variables
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success = req.session.success || null;
    res.locals.error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    next();
});

// Home - Landing Page
app.get('/', (req, res) => {
    res.render('index', { title: 'Skyline Residency – Smart Apartment Portal' });
});

// Public Complaint & Tracking routes
app.use('/', complaintRoutes);

// Auth routes (Admin login, logout)
app.use('/', authRoutes);

// Admin routes (prefixed with /admin)
app.use('/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Unhandled Error:', err.stack);
    res.status(500).render('404', {
        title: 'Server Error',
        message: err.message || 'Something went wrong!'
    });
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
    console.log(`   📝  Register Complaint : http://localhost:${PORT}/complaints/new`);
    console.log(`   🔍  Track Complaint    : http://localhost:${PORT}/track`);
    console.log(`   🛡️  Admin Login        : http://localhost:${PORT}/admin/login`);
    console.log('');
});
