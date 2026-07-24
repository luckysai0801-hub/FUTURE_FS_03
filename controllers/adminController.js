// =============================================
// controllers/adminController.js
// Handles all Society Manager Admin Panel REST API operations
// Skyline Residency – Smart Apartment Portal
// =============================================

const db = require('../config/db');

// ---- ADMIN DASHBOARD ----

// GET /api/admin/dashboard
exports.dashboard = async (req, res) => {
    try {
        // Get overall complaint statistics
        const [stats] = await db.query(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
            FROM complaints
        `);

        // Get total unique residents count from complaints
        const [userCount] = await db.query("SELECT COUNT(DISTINCT mobile_number) as total FROM complaints");

        // Get count of total active maintenance work orders (Pending + In Progress)
        const [activeRequests] = await db.query("SELECT COUNT(*) as total FROM complaints WHERE status IN ('Pending', 'In Progress')");

        // Get count of active announcements
        const [announcements] = await db.query("SELECT COUNT(*) as total FROM announcements");

        // Get recent 10 complaints
        const [recentComplaints] = await db.query(`
            SELECT c.*, c.resident_name as user_name
            FROM complaints c
            ORDER BY c.created_at DESC
            LIMIT 10
        `);

        // Get complaints by category
        const [byCategory] = await db.query(`
            SELECT category, COUNT(*) as count
            FROM complaints
            GROUP BY category
            ORDER BY count DESC
        `);

        // Get complaints by department/location
        const [byDepartment] = await db.query(`
            SELECT department, COUNT(*) as count
            FROM complaints
            GROUP BY department
            ORDER BY count DESC
        `);

        return res.json({
            success: true,
            stats: { 
                ...stats[0], 
                totalUsers: userCount[0].total || 0,
                maintenanceRequests: activeRequests[0].total || 0,
                announcementsCount: announcements[0].total || 0
            },
            recentComplaints,
            byCategory,
            byDepartment
        });
    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch admin dashboard statistics.',
            stats: { total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0, totalUsers: 0, maintenanceRequests: 0, announcementsCount: 0 },
            recentComplaints: [],
            byCategory: [],
            byDepartment: []
        });
    }
};

// ---- MANAGE COMPLAINTS ----

// GET /api/admin/complaints
exports.listComplaints = async (req, res) => {
    try {
        const { search, status, category, department, priority } = req.query;

        let query = `
            SELECT c.*, c.resident_name as user_name, c.email as user_email, c.mobile_number as user_phone
            FROM complaints c
            WHERE 1=1
        `;
        let params = [];

        if (search) {
            query += ' AND (c.complaint_id LIKE ? OR c.resident_name LIKE ? OR c.title LIKE ? OR c.department LIKE ? OR c.mobile_number LIKE ?)';
            params.push('%' + search + '%', '%' + search + '%', '%' + search + '%', '%' + search + '%', '%' + search + '%');
        }
        if (status) {
            query += ' AND c.status = ?';
            params.push(status);
        }
        if (category) {
            query += ' AND c.category = ?';
            params.push(category);
        }
        if (department) {
            query += ' AND c.department = ?';
            params.push(department);
        }
        if (priority) {
            query += ' AND c.priority = ?';
            params.push(priority);
        }

        query += ' ORDER BY c.created_at DESC';

        const [complaints] = await db.query(query, params);

        return res.json({
            success: true,
            complaints,
            filters: { search: search || '', status: status || '', category: category || '', department: department || '', priority: priority || '' }
        });
    } catch (error) {
        console.error('Admin Complaints List Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch complaints list.', complaints: [] });
    }
};

// GET /api/admin/complaints/:id
exports.complaintDetail = async (req, res) => {
    try {
        const [complaints] = await db.query(`
            SELECT c.*, c.resident_name as user_name, c.email as user_email, c.mobile_number as user_phone
            FROM complaints c
            WHERE c.id = ?
        `, [req.params.id]);

        if (complaints.length === 0) {
            return res.status(404).json({ success: false, error: 'Complaint record not found.' });
        }

        // Get audit updates history
        const [updates] = await db.query(`
            SELECT cu.*, u.full_name as updated_by_name
            FROM complaint_updates cu
            JOIN users u ON cu.updated_by = u.id
            WHERE cu.complaint_id = ?
            ORDER BY cu.updated_at DESC
        `, [req.params.id]);

        return res.json({
            success: true,
            complaint: complaints[0],
            updates
        });
    } catch (error) {
        console.error('Admin Complaint Detail Error:', error);
        return res.status(500).json({ success: false, error: 'Error loading complaint record details.' });
    }
};

// POST /api/admin/complaints/:id/status
exports.updateStatus = async (req, res) => {
    try {
        const { new_status, remarks } = req.body;
        const complaintId = req.params.id;
        const adminId = req.session.user.id;

        if (!new_status) {
            return res.status(400).json({ success: false, error: 'Target status is required.' });
        }

        const [complaints] = await db.query('SELECT status FROM complaints WHERE id = ?', [complaintId]);

        if (complaints.length === 0) {
            return res.status(404).json({ success: false, error: 'Complaint not found.' });
        }

        const oldStatus = complaints[0].status;

        // Update complaint status & manager remarks
        await db.query(
            'UPDATE complaints SET status = ?, admin_remarks = ? WHERE id = ?',
            [new_status, remarks || null, complaintId]
        );

        // Audit log insert
        await db.query(`
            INSERT INTO complaint_updates (complaint_id, updated_by, old_status, new_status, remarks)
            VALUES (?, ?, ?, ?, ?)
        `, [complaintId, adminId, oldStatus, new_status, remarks || null]);

        return res.json({
            success: true,
            message: `Maintenance ticket status updated to "${new_status}" successfully!`
        });

    } catch (error) {
        console.error('Update Status Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update ticket status.' });
    }
};

// POST /api/admin/complaints/:id/details
exports.updateDetails = async (req, res) => {
    try {
        const { assigned_to, admin_remarks } = req.body;
        const complaintId = req.params.id;

        await db.query(
            'UPDATE complaints SET assigned_to = ?, admin_remarks = ? WHERE id = ?',
            [assigned_to || null, admin_remarks || null, complaintId]
        );

        return res.json({
            success: true,
            message: 'Maintenance team assignment & notes saved successfully!'
        });

    } catch (error) {
        console.error('Update Details Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update ticket details.' });
    }
};

// POST or DELETE /api/admin/complaints/:id/delete
exports.deleteComplaint = async (req, res) => {
    try {
        const complaintId = req.params.id;

        await db.query('DELETE FROM complaints WHERE id = ?', [complaintId]);

        return res.json({
            success: true,
            message: 'Complaint record deleted successfully.'
        });
    } catch (error) {
        console.error('Delete Complaint Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete complaint record.' });
    }
};

// ---- MANAGE ANNOUNCEMENTS ----

// GET /api/admin/announcements
exports.listAnnouncements = async (req, res) => {
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
        console.error('List Announcements Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to list announcements.', announcements: [] });
    }
};

// POST /api/admin/announcements
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, category, priority } = req.body;
        const adminId = req.session.user.id;

        if (!title || !content) {
            return res.status(400).json({ success: false, error: 'Title and Content are required for announcements.' });
        }

        await db.query(`
            INSERT INTO announcements (title, content, category, priority, created_by)
            VALUES (?, ?, ?, ?, ?)
        `, [title.trim(), content.trim(), category || 'General Notice', priority || 'Medium', adminId]);

        return res.json({
            success: true,
            message: 'Announcement broadcasted successfully!'
        });

    } catch (error) {
        console.error('Create Announcement Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to broadcast announcement.' });
    }
};

// POST or DELETE /api/admin/announcements/:id/delete
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcementId = req.params.id;

        await db.query('DELETE FROM announcements WHERE id = ?', [announcementId]);

        return res.json({
            success: true,
            message: 'Announcement deleted successfully.'
        });
    } catch (error) {
        console.error('Delete Announcement Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete announcement.' });
    }
};

// ---- MANAGE RESIDENTS DIRECTORY ----

// GET /api/admin/users
exports.listUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT
                resident_name as full_name,
                email,
                mobile_number as phone,
                CONCAT(block_wing, ' - ', flat_number) as location,
                COUNT(id) as complaint_count,
                MAX(created_at) as created_at
            FROM complaints
            GROUP BY resident_name, email, mobile_number, block_wing, flat_number
            ORDER BY MAX(created_at) DESC
        `);

        return res.json({ success: true, users });
    } catch (error) {
        console.error('Admin Users Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch resident directory.', users: [] });
    }
};

// ---- REPORTS & CSV/PDF EXPORT ----

// GET /admin/export/csv - Stream CSV file download directly
exports.exportCSV = async (req, res) => {
    try {
        const [complaints] = await db.query(`
            SELECT c.complaint_id, c.resident_name, c.email as resident_email, c.mobile_number,
                   c.title, c.category, c.department, c.priority, c.status,
                   c.admin_remarks, c.assigned_to,
                   DATE_FORMAT(c.created_at, '%d-%b-%Y') as submitted_date,
                   DATE_FORMAT(c.updated_at, '%d-%b-%Y') as last_updated
            FROM complaints c
            ORDER BY c.created_at DESC
        `);

        const headers = ['Complaint ID','Resident Name','Email','Mobile','Title','Category','Flat/Block Location','Priority','Status','Management Remarks','Assigned Staff','Submitted Date','Last Updated'];
        const rows = complaints.map(c => [
            c.complaint_id,
            c.resident_name,
            c.resident_email || 'N/A',
            c.mobile_number,
            '"' + (c.title || '').replace(/"/g, '""') + '"',
            c.category,
            c.department,
            c.priority,
            c.status,
            '"' + (c.admin_remarks || '').replace(/"/g, '""') + '"',
            c.assigned_to || '',
            c.submitted_date,
            c.last_updated
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const filename = `Skyline_Residency_Maintenance_Report_${new Date().toISOString().slice(0,10)}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvContent);
    } catch (error) {
        console.error('CSV Export Error:', error);
        res.status(500).send('Failed to export CSV report.');
    }
};

// GET /api/admin/export/pdf-data - Return data for PDF report page
exports.exportPDFData = async (req, res) => {
    try {
        const [complaints] = await db.query(`
            SELECT c.complaint_id, c.resident_name, c.title, c.category,
                   c.department, c.priority, c.status,
                   DATE_FORMAT(c.created_at, '%d-%b-%Y') as submitted_date
            FROM complaints c
            ORDER BY c.created_at DESC
        `);

        const [stats] = await db.query(`
            SELECT COUNT(*) as total,
                SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status='In Progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status='Resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN status='Rejected' THEN 1 ELSE 0 END) as rejected
            FROM complaints
        `);

        return res.json({
            success: true,
            complaints,
            stats: stats[0],
            generatedAt: new Date().toLocaleString('en-IN')
        });
    } catch (error) {
        console.error('PDF Export Data Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to generate PDF audit data.' });
    }
};

// GET /api/admin/reports - Analytics & reports page data
exports.reports = async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
            FROM complaints
        `);

        const [byCategory] = await db.query(`
            SELECT category, COUNT(*) as count,
                SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
            FROM complaints GROUP BY category ORDER BY count DESC
        `);

        const [byDepartment] = await db.query(`
            SELECT department, COUNT(*) as count,
                SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
            FROM complaints GROUP BY department ORDER BY count DESC
        `);

        const [byPriority] = await db.query(`
            SELECT priority, COUNT(*) as count FROM complaints GROUP BY priority
        `);

        const [monthlyTrend] = await db.query(`
            SELECT
                DATE_FORMAT(created_at, '%b %Y') as month,
                DATE_FORMAT(created_at, '%Y-%m') as month_key,
                COUNT(*) as count
            FROM complaints
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month_key, month
            ORDER BY month_key ASC
        `);

        const [recentResolved] = await db.query(`
            SELECT c.complaint_id, c.title, c.category, c.department,
                   c.resident_name as user_name, c.updated_at
            FROM complaints c
            WHERE c.status = 'Resolved'
            ORDER BY c.updated_at DESC
            LIMIT 10
        `);

        return res.json({
            success: true,
            stats: stats[0],
            byCategory,
            byDepartment,
            byPriority,
            monthlyTrend,
            recentResolved
        });
    } catch (error) {
        console.error('Reports API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics and report metrics.',
            stats: {},
            byCategory: [],
            byDepartment: [],
            byPriority: [],
            monthlyTrend: [],
            recentResolved: []
        });
    }
};
