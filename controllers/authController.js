// =============================================
// controllers/authController.js
// Handles Society Manager Admin Authentication & Logout via REST API
// Skyline Residency – Smart Apartment Portal
// =============================================

const bcrypt = require('bcrypt');
const db = require('../config/db');

// GET /api/auth/check - Check current session user
exports.checkAuth = (req, res) => {
    if (req.session && req.session.user) {
        return res.json({ authenticated: true, user: req.session.user });
    }
    return res.json({ authenticated: false, user: null });
};

// POST /api/auth/login - Handle admin login via JSON API
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email address and password are required.' });
        }

        // Find admin user in MySQL database
        const [admins] = await db.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'admin']);

        if (admins.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
        }

        const admin = admins[0];

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
        }

        // Create admin session
        req.session.user = {
            id: admin.id,
            full_name: admin.full_name,
            email: admin.email,
            role: admin.role
        };

        return res.json({
            success: true,
            message: `Welcome, Society Manager ${admin.full_name}!`,
            user: req.session.user
        });

    } catch (error) {
        console.error('Admin Login Error:', error);
        return res.status(500).json({ success: false, error: 'Login failed due to a server error. Please try again.' });
    }
};

// GET /api/auth/logout - Destroy admin session and return status
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout Error:', err);
            return res.status(500).json({ success: false, error: 'Failed to logout cleanly.' });
        }
        res.clearCookie('connect.sid');
        return res.json({ success: true, message: 'Logged out successfully.' });
    });
};
