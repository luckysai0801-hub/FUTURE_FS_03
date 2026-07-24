// =============================================
// controllers/complaintController.js
// Handles Public Complaint Submission & Public Tracking (No Login Required)
// Skyline Residency – Smart Apartment Portal
// =============================================

const db = require('../config/db');

// Helper: Generate Complaint ID in format CMP-2026-000145
async function generateComplaintId() {
    const year = new Date().getFullYear();
    const [rows] = await db.query('SELECT COUNT(*) as count FROM complaints');
    const nextNumber = rows[0].count + 145;
    return `CMP-${year}-${String(nextNumber).padStart(6, '0')}`;
}

// GET /complaints/new - Show public complaint registration form
exports.showNewComplaint = (req, res) => {
    res.render('user/new-complaint', {
        title: 'Register Complaint – Skyline Residency',
        submittedComplaintId: req.session.submittedComplaintId || null,
        formData: req.session.formData || {}
    });
    delete req.session.submittedComplaintId;
    delete req.session.formData;
};

// POST /complaints - Handle public complaint submission
exports.createComplaint = async (req, res) => {
    try {
        const {
            resident_name,
            flat_number,
            mobile_number,
            email,
            block_wing,
            category,
            title,
            description,
            priority
        } = req.body;

        // Store form data in session so user inputs are preserved if validation fails
        req.session.formData = { resident_name, flat_number, mobile_number, email, block_wing, category, title, description, priority };

        // Validation 1: Required fields cannot be empty
        if (!resident_name || !flat_number || !mobile_number || !block_wing || !category || !title || !description || !priority) {
            req.session.error = 'Please fill in all required fields (Full Name, Flat Number, Mobile, Block, Category, Title, Description, and Priority).';
            return res.redirect('/complaints/new');
        }

        // Validation 2: Mobile number must be valid 10-digit format
        const cleanMobile = mobile_number.trim();
        if (!/^[0-9]{10}$/.test(cleanMobile)) {
            req.session.error = 'Please enter a valid 10-digit mobile number (e.g. 9876543210).';
            return res.redirect('/complaints/new');
        }

        // Validation 3: Complaint Description minimum 20 characters
        if (description.trim().length < 20) {
            req.session.error = 'Complaint Description must be at least 20 characters long.';
            return res.redirect('/complaints/new');
        }

        // Image path if uploaded
        const imagePath = req.file ? '/uploads/' + req.file.filename : null;

        // Auto-generate Complaint ID (e.g. CMP-2026-000145)
        const complaintId = await generateComplaintId();

        // Location department mapping
        const locationDept = `${block_wing.trim()} - ${flat_number.trim()}`;

        // Insert directly into complaints table
        await db.query(`
            INSERT INTO complaints (
                complaint_id, resident_name, flat_number, mobile_number, email,
                block_wing, title, category, department, priority, description, image_path, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        `, [
            complaintId,
            resident_name.trim(),
            flat_number.trim(),
            cleanMobile,
            email ? email.trim() : null,
            block_wing.trim(),
            title.trim(),
            category,
            locationDept,
            priority,
            description.trim(),
            imagePath
        ]);

        delete req.session.formData;
        req.session.success = 'Your complaint has been submitted successfully! Please save your Complaint ID to track the complaint status.';
        req.session.submittedComplaintId = complaintId;
        res.redirect('/track?id=' + complaintId);

    } catch (error) {
        console.error('Public Create Complaint Error:', error);
        req.session.error = 'Failed to submit complaint. Please try again.';
        res.redirect('/complaints/new');
    }
};

// GET /track - Show public complaint tracking search page
exports.showTrack = async (req, res) => {
    try {
        const rawId = req.query.id ? req.query.id.trim() : null;

        if (!rawId) {
            return res.render('user/my-complaints', {
                title: 'Track Complaint – Skyline Residency',
                searchId: '',
                complaint: null,
                updates: []
            });
        }

        const complaintId = rawId.toUpperCase();

        // Search complaint by Complaint ID (case-insensitive fallback)
        const [rows] = await db.query(
            'SELECT * FROM complaints WHERE UPPER(complaint_id) = ? OR complaint_id = ?',
            [complaintId, rawId]
        );

        if (rows.length === 0) {
            req.session.error = `No complaint record found matching ID: "${rawId}". Please check the ID and try again.`;
            return res.render('user/my-complaints', {
                title: 'Track Complaint – Skyline Residency',
                searchId: rawId,
                complaint: null,
                updates: []
            });
        }

        const complaint = rows[0];

        // Get timeline updates
        const [updates] = await db.query(`
            SELECT cu.*, u.full_name as updated_by_name
            FROM complaint_updates cu
            JOIN users u ON cu.updated_by = u.id
            WHERE cu.complaint_id = ?
            ORDER BY cu.updated_at DESC
        `, [complaint.id]);

        res.render('user/my-complaints', {
            title: `Track Complaint ${complaint.complaint_id} – Skyline Residency`,
            searchId: complaint.complaint_id,
            complaint,
            updates
        });

    } catch (error) {
        console.error('Track Complaint Error:', error);
        res.render('user/my-complaints', {
            title: 'Track Complaint – Skyline Residency',
            searchId: '',
            complaint: null,
            updates: []
        });
    }
};

// POST /track - Perform tracking lookup from search form
exports.searchTrack = (req, res) => {
    const complaintId = req.body.complaint_id ? req.body.complaint_id.trim() : '';
    if (!complaintId) {
        req.session.error = 'Please enter a Complaint ID to search.';
        return res.redirect('/track');
    }
    res.redirect('/track?id=' + encodeURIComponent(complaintId));
};

// GET /announcements - Public notice board
exports.showAnnouncements = async (req, res) => {
    try {
        const [announcements] = await db.query(`
            SELECT a.*, u.full_name as author_name
            FROM announcements a
            LEFT JOIN users u ON a.created_by = u.id
            ORDER BY a.created_at DESC
        `);

        res.render('user/announcements', {
            title: 'Society Announcements – Skyline Residency',
            announcements
        });
    } catch (error) {
        console.error('Announcements Error:', error);
        res.render('user/announcements', {
            title: 'Society Announcements',
            announcements: []
        });
    }
};
