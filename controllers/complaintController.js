// =============================================
// controllers/complaintController.js
// Handles Public Complaint Submission, Tracking & Public Announcements via REST API
// Skyline Residency – Smart Apartment Portal
// =============================================

const db = require('../config/db');

// Helper: Generate Complaint ID in format CMP-2026-000145
async function generateComplaintId() {
    const year = new Date().getFullYear();
    const [rows] = await db.query('SELECT MAX(id) as max_id FROM complaints');
    const nextNumber = (rows[0].max_id || 0) + 145;
    return `CMP-${year}-${String(nextNumber).padStart(6, '0')}`;
}


// POST /api/complaints - Handle public complaint submission
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

        // Validation 1: Required fields cannot be empty
        if (!resident_name || !flat_number || !mobile_number || !block_wing || !category || !title || !description || !priority) {
            return res.status(400).json({
                success: false,
                error: 'Please fill in all required fields (Full Name, Flat Number, Mobile, Block, Category, Title, Description, and Priority).'
            });
        }

        // Validation 2: Mobile number must be valid 10-digit format
        const cleanMobile = mobile_number.trim();
        if (!/^[0-9]{10}$/.test(cleanMobile)) {
            return res.status(400).json({
                success: false,
                error: 'Please enter a valid 10-digit mobile number (e.g. 9876543210).'
            });
        }

        // Validation 3: Complaint Description minimum 20 characters
        if (description.trim().length < 20) {
            return res.status(400).json({
                success: false,
                error: 'Complaint Description must be at least 20 characters long.'
            });
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

        return res.json({
            success: true,
            message: 'Your complaint has been submitted successfully! Save your Complaint ID to track status.',
            complaintId
        });

    } catch (error) {
        console.error('Public Create Complaint Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to submit complaint. Please try again.'
        });
    }
};

// GET /api/track?id=... - Track public complaint lookup
exports.trackComplaint = async (req, res) => {
    try {
        const rawId = req.query.id ? req.query.id.trim() : (req.params.id ? req.params.id.trim() : null);

        if (!rawId) {
            return res.status(400).json({
                success: false,
                error: 'Please enter a Complaint ID to track.'
            });
        }

        const complaintId = rawId.toUpperCase();

        // Search complaint by Complaint ID (case-insensitive fallback)
        const [rows] = await db.query(
            'SELECT * FROM complaints WHERE UPPER(complaint_id) = ? OR complaint_id = ?',
            [complaintId, rawId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: `No complaint record found matching ID: "${rawId}". Please check the ID and try again.`
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

        return res.json({
            success: true,
            complaint,
            updates
        });

    } catch (error) {
        console.error('Track Complaint Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error tracking complaint details.'
        });
    }
};

// GET /api/announcements - Public notice board API
exports.getAnnouncements = async (req, res) => {
    try {
        const [announcements] = await db.query(`
            SELECT a.*, u.full_name as author_name
            FROM announcements a
            LEFT JOIN users u ON a.created_by = u.id
            ORDER BY a.created_at DESC
        `);

        return res.json({
            success: true,
            announcements
        });
    } catch (error) {
        console.error('Announcements API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch announcements.'
        });
    }
};
