// =============================================
// controllers/authController.js
// Handles Society Manager Admin Authentication & Logout
// Skyline Residency – Smart Apartment Portal
// =============================================

const bcrypt = require('bcrypt');
const db = require('../config/db');

// ---- ADMIN LOGIN ----

// GET /admin/login - Show admin login form
exports.showAdminLogin = (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
    res.render('auth/admin-login', { title: 'Society Manager Login – Skyline Residency' });
};

// POST /admin/login - Handle admin login
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            req.session.error = 'Email address and password are required.';
            return res.redirect('/admin/login');
        }

        // Find admin user
        const [admins] = await db.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'admin']);

        if (admins.length === 0) {
            req.session.error = 'Invalid admin credentials.';
            return res.redirect('/admin/login');
        }

        const admin = admins[0];

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            req.session.error = 'Invalid admin credentials.';
            return res.redirect('/admin/login');
        }

        // Create admin session
        req.session.user = {
            id: admin.id,
            full_name: admin.full_name,
            email: admin.email,
            role: admin.role
        };

        req.session.success = `Welcome, Society Manager ${admin.full_name}!`;
        res.redirect('/admin/dashboard');

    } catch (error) {
        console.error('Admin Login Error:', error);
        req.session.error = 'Login failed. Please try again.';
        res.redirect('/admin/login');
    }
};

// ---- LOGOUT ----

// GET /logout - Destroy admin session and redirect to home
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Logout Error:', err);
        res.redirect('/');
    });
};
