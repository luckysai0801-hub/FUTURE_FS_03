// =============================================
// middleware/authMiddleware.js
// Checks if resident or admin is logged in
// Skyline Residency – Smart Apartment Portal
// =============================================

// Protect routes - only for logged-in users
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next(); // Resident or Admin logged in
    }
    req.session.error = 'Please login to access the resident portal.';
    res.redirect('/login');
};

// Check if user is a resident user
const isUser = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'user') {
        return next();
    }
    req.session.error = 'Access restricted to Skyline residents.';
    res.redirect('/login');
};

module.exports = { isAuthenticated, isUser };
