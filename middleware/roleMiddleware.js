// =============================================
// middleware/roleMiddleware.js
// Checks if user has admin / society manager role
// Skyline Residency – Smart Apartment Portal
// =============================================

// Protect routes - only for admin / society management
const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next(); // Admin is logged in
    }
    req.session.error = 'Access denied. Society Manager administrator privileges required.';
    res.redirect('/admin/login');
};

module.exports = { isAdmin };
