// =============================================
// public/js/admin.js
// Society Manager Admin Panel Operations via REST API
// Skyline Residency – Smart Apartment Portal
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Dispatch page handlers based on URL
    if (path.endsWith('/dashboard.html') || path.endsWith('/dashboard') || path.endsWith('/admin')) {
        loadAdminDashboard();
    } else if (path.includes('admin-complaints.html')) {
        loadAdminComplaints();
    } else if (path.includes('admin-complaint-detail.html')) {
        loadAdminComplaintDetail();
    } else if (path.includes('admin-announcements.html')) {
        loadAdminAnnouncements();
    } else if (path.includes('admin-users.html')) {
        loadAdminUsers();
    } else if (path.includes('admin-reports.html')) {
        loadAdminReports();
    }
});

// Helper: Escape HTML to prevent XSS vulnerability
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// =============================================
// 1. ADMIN DASHBOARD HANDLER
// =============================================
async function loadAdminDashboard() {
    try {
        const res = await fetch('/api/admin/dashboard');
        if (res.status === 401) {
            window.location.href = '/admin-login.html';
            return;
        }
        const data = await res.json();
        if (!data.success) return;

        const s = data.stats || {};
        document.getElementById('statTotal').textContent = s.total || 0;
        document.getElementById('statPending').textContent = s.pending || 0;
        document.getElementById('statInProgress').textContent = s.in_progress || 0;
        document.getElementById('statResolved').textContent = s.resolved || 0;
        document.getElementById('statRejected').textContent = s.rejected || 0;
        document.getElementById('statActiveRequests').textContent = s.maintenanceRequests || 0;
        document.getElementById('statTotalUsers').textContent = s.totalUsers || 0;
        document.getElementById('statAnnouncements').textContent = s.announcementsCount || 0;

        // Populate Recent 10 Complaints Table
        const tbody = document.getElementById('recentComplaintsBody');
        if (data.recentComplaints && data.recentComplaints.length > 0) {
            tbody.innerHTML = data.recentComplaints.map(c => `
                <tr style="border-bottom: 1px solid var(--border-light);">
                    <td style="padding: 0.75rem; font-family: monospace; font-weight: 700; color: var(--primary);">${escapeHtml(c.complaint_id)}</td>
                    <td style="padding: 0.75rem;">${escapeHtml(c.user_name || c.resident_name)}</td>
                    <td style="padding: 0.75rem;"><span class="badge" style="background: var(--primary-light); color: var(--primary);">${escapeHtml(c.category)}</span></td>
                    <td style="padding: 0.75rem;">${escapeHtml(c.department || c.block_wing)}</td>
                    <td style="padding: 0.75rem;">${escapeHtml(c.priority)}</td>
                    <td style="padding: 0.75rem;">${getStatusBadgeHtml(c.status)}</td>
                    <td style="padding: 0.75rem;">
                        <a href="/admin-complaint-detail.html?id=${c.id}" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-eye"></i> Inspect
                        </a>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No complaints recorded yet.</td></tr>';
        }

        // Category breakdown
        const catContainer = document.getElementById('categoryBreakdown');
        if (data.byCategory && data.byCategory.length > 0) {
            catContainer.innerHTML = data.byCategory.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--bg); border-radius: var(--radius-xs);">
                    <span style="font-size: 0.9rem; font-weight: 600;">${escapeHtml(item.category)}</span>
                    <strong class="badge badge-in-progress">${item.count} tickets</strong>
                </div>
            `).join('');
        } else {
            catContainer.innerHTML = '<p style="color: var(--text-muted);">No category data available.</p>';
        }

        // Department breakdown
        const deptContainer = document.getElementById('departmentBreakdown');
        if (data.byDepartment && data.byDepartment.length > 0) {
            deptContainer.innerHTML = data.byDepartment.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--bg); border-radius: var(--radius-xs);">
                    <span style="font-size: 0.9rem; font-weight: 600;">${escapeHtml(item.department)}</span>
                    <strong class="badge badge-resolved">${item.count} tickets</strong>
                </div>
            `).join('');
        } else {
            deptContainer.innerHTML = '<p style="color: var(--text-muted);">No department data available.</p>';
        }

    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

// =============================================
// 2. ADMIN COMPLAINTS LIST HANDLER
// =============================================
async function loadAdminComplaints() {
    const filterForm = document.getElementById('complaintsFilterForm');
    const resetBtn = document.getElementById('resetFilterBtn');

    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            fetchFilteredComplaints();
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                filterForm.reset();
                fetchFilteredComplaints();
            });
        }
    }

    fetchFilteredComplaints();
}

async function fetchFilteredComplaints() {
    const tbody = document.getElementById('complaintsTableBody');
    const countBadge = document.getElementById('recordCountBadge');

    const search = document.getElementById('filterSearch') ? document.getElementById('filterSearch').value.trim() : '';
    const status = document.getElementById('filterStatus') ? document.getElementById('filterStatus').value : '';
    const category = document.getElementById('filterCategory') ? document.getElementById('filterCategory').value : '';
    const priority = document.getElementById('filterPriority') ? document.getElementById('filterPriority').value : '';

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (priority) params.append('priority', priority);

    try {
        const res = await fetch(`/api/admin/complaints?${params.toString()}`);
        if (res.status === 401) {
            window.location.href = '/admin-login.html';
            return;
        }
        const data = await res.json();

        if (!data.success || !data.complaints) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #DC2626;">Error loading complaints.</td></tr>';
            return;
        }

        const complaints = data.complaints;
        countBadge.textContent = `Showing ${complaints.length} Complaints`;

        if (complaints.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);"><i class="fas fa-inbox fa-2x" style="margin-bottom: 0.5rem; display:block;"></i>No matching complaints found.</td></tr>';
            return;
        }

        tbody.innerHTML = complaints.map(c => `
            <tr style="border-bottom: 1px solid var(--border-light);">
                <td style="padding: 0.75rem; font-family: monospace; font-weight: 700; color: var(--primary);">${escapeHtml(c.complaint_id)}</td>
                <td style="padding: 0.75rem;">
                    <strong>${escapeHtml(c.user_name || c.resident_name)}</strong><br>
                    <small style="color: var(--text-muted);">${escapeHtml(c.mobile_number || '')}</small>
                </td>
                <td style="padding: 0.75rem;">${escapeHtml(c.department || (c.block_wing + ' - ' + c.flat_number))}</td>
                <td style="padding: 0.75rem;">
                    <strong>${escapeHtml(c.title)}</strong><br>
                    <span class="badge" style="background: var(--primary-light); color: var(--primary); font-size: 0.75rem;">${escapeHtml(c.category)}</span>
                </td>
                <td style="padding: 0.75rem;">${escapeHtml(c.priority)}</td>
                <td style="padding: 0.75rem;">${getStatusBadgeHtml(c.status)}</td>
                <td style="padding: 0.75rem;">
                    <a href="/admin-complaint-detail.html?id=${c.id}" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-edit"></i> Inspect & Update
                    </a>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error('Fetch complaints error:', err);
    }
}

// =============================================
// 3. ADMIN COMPLAINT DETAIL WORKSPACE HANDLER
// =============================================
async function loadAdminComplaintDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const dbId = urlParams.get('id');

    if (!dbId) {
        alert('Invalid complaint ID parameter.');
        window.location.href = '/admin-complaints.html';
        return;
    }

    // Load complaint detail data
    try {
        const res = await fetch(`/api/admin/complaints/${dbId}`);
        if (res.status === 401) {
            window.location.href = '/admin-login.html';
            return;
        }
        const data = await res.json();

        if (!data.success || !data.complaint) {
            alert('Complaint record not found.');
            window.location.href = '/admin-complaints.html';
            return;
        }

        const c = data.complaint;
        const updates = data.updates || [];

        // Render card info
        document.getElementById('detailIdBadge').textContent = c.complaint_id;
        document.getElementById('detailTitle').textContent = c.title;
        document.getElementById('detailResident').textContent = c.resident_name || c.user_name;
        document.getElementById('detailMobile').textContent = c.mobile_number || c.user_phone || 'N/A';
        document.getElementById('detailEmail').textContent = c.email || c.user_email || 'N/A';
        document.getElementById('detailLocation').textContent = c.department || `${c.block_wing} - ${c.flat_number}`;
        document.getElementById('detailCategory').textContent = c.category;
        document.getElementById('detailPriority').textContent = `${c.priority} Priority`;
        document.getElementById('detailDescription').textContent = c.description;

        const statusBadge = document.getElementById('detailStatusBadge');
        statusBadge.textContent = c.status;
        statusBadge.className = 'badge ' + getStatusBadgeClass(c.status);

        // Pre-fill update status select & remarks
        const statusSelect = document.getElementById('new_status');
        if (statusSelect) statusSelect.value = c.status;
        if (document.getElementById('statusRemarks')) document.getElementById('statusRemarks').value = c.admin_remarks || '';
        if (document.getElementById('assigned_to')) document.getElementById('assigned_to').value = c.assigned_to || '';
        if (document.getElementById('admin_remarks')) document.getElementById('admin_remarks').value = c.admin_remarks || '';

        // Image attachment
        if (c.image_path) {
            document.getElementById('detailImageSection').style.display = 'block';
            document.getElementById('detailImage').src = c.image_path;
            document.getElementById('detailImageLink').href = c.image_path;
        }

        // Audit timeline
        renderAdminAuditTimeline(updates);

    } catch (err) {
        console.error('Detail load error:', err);
    }

    // Handle Update Status Form Submission
    const updateStatusForm = document.getElementById('updateStatusForm');
    if (updateStatusForm) {
        updateStatusForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const new_status = document.getElementById('new_status').value;
            const remarks = document.getElementById('statusRemarks').value.trim();

            try {
                const res = await fetch(`/api/admin/complaints/${dbId}/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ new_status, remarks })
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    showDetailAlert(data.message || 'Status updated successfully!', 'success');
                    setTimeout(() => location.reload(), 800);
                } else {
                    showDetailAlert(data.error || 'Failed to update status.', 'error');
                }
            } catch (err) {
                showDetailAlert('Error saving status update.', 'error');
            }
        });
    }

    // Handle Staff Assignment Form Submission
    const updateDetailsForm = document.getElementById('updateDetailsForm');
    if (updateDetailsForm) {
        updateDetailsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const assigned_to = document.getElementById('assigned_to').value.trim();
            const admin_remarks = document.getElementById('admin_remarks').value.trim();

            try {
                const res = await fetch(`/api/admin/complaints/${dbId}/details`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ assigned_to, admin_remarks })
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    showDetailAlert(data.message || 'Staff assignment saved!', 'success');
                    setTimeout(() => location.reload(), 800);
                } else {
                    showDetailAlert(data.error || 'Failed to save details.', 'error');
                }
            } catch (err) {
                showDetailAlert('Error saving details.', 'error');
            }
        });
    }

    // Delete Button Handler
    const deleteBtn = document.getElementById('deleteTicketBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to permanently delete this complaint record?')) return;

            try {
                const res = await fetch(`/api/admin/complaints/${dbId}`, { method: 'DELETE' });
                const data = await res.json();

                if (res.ok && data.success) {
                    alert('Complaint deleted.');
                    window.location.href = '/admin-complaints.html';
                } else {
                    alert(data.error || 'Delete failed.');
                }
            } catch (err) {
                alert('Error deleting complaint.');
            }
        });
    }
}

function renderAdminAuditTimeline(updates) {
    const container = document.getElementById('detailUpdatesTimeline');
    if (!updates || updates.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">No status updates recorded yet.</p>';
        return;
    }

    container.innerHTML = updates.map(u => {
        const timeStr = new Date(u.updated_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return `
            <div style="padding: 1rem; border-left: 3px solid var(--primary); background: var(--bg); border-radius: var(--radius-sm); margin-bottom: 0.85rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                    <strong>Changed: ${escapeHtml(u.old_status || 'Pending')} &rarr; ${escapeHtml(u.new_status)}</strong>
                    <small style="color: var(--text-muted);">${timeStr}</small>
                </div>
                ${u.remarks ? `<p style="margin: 0.25rem 0; font-size: 0.88rem; color: var(--text-dark);">${escapeHtml(u.remarks)}</p>` : ''}
                <small style="color: var(--text-muted); font-size: 0.8rem;">By: ${escapeHtml(u.updated_by_name || 'Admin')}</small>
            </div>
        `;
    }).join('');
}

function showDetailAlert(msg, type = 'error') {
    const alertBox = document.getElementById('detailAlert');
    if (!alertBox) return;
    const isSuccess = type === 'success';
    alertBox.style.display = 'block';
    alertBox.innerHTML = `
        <div style="background: ${isSuccess ? '#D1FAE5' : '#FEE2E2'}; color: ${isSuccess ? '#059669' : '#DC2626'}; border: 1px solid ${isSuccess ? '#A7F3D0' : '#FECACA'}; padding: 0.85rem 1.25rem; border-radius: var(--radius-sm);">
            <i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${escapeHtml(msg)}
        </div>
    `;
}

// =============================================
// 4. ADMIN ANNOUNCEMENTS HANDLER
// =============================================
async function loadAdminAnnouncements() {
    fetchAdminAnnouncements();

    const createForm = document.getElementById('createAnnouncementForm');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('announcementTitle').value.trim();
            const category = document.getElementById('announcementCategory').value;
            const priority = document.getElementById('announcementPriority').value;
            const content = document.getElementById('announcementContent').value.trim();

            if (!title || !content) {
                alert('Title and Content are required.');
                return;
            }

            try {
                const res = await fetch('/api/admin/announcements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, category, priority, content })
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    createForm.reset();
                    fetchAdminAnnouncements();
                } else {
                    alert(data.error || 'Failed to create announcement.');
                }
            } catch (err) {
                alert('Error broadcasting announcement.');
            }
        });
    }
}

async function fetchAdminAnnouncements() {
    const container = document.getElementById('adminAnnouncementsList');
    try {
        const res = await fetch('/api/admin/announcements');
        if (res.status === 401) {
            window.location.href = '/admin-login.html';
            return;
        }
        const data = await res.json();

        if (!data.success || !data.announcements || data.announcements.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No active broadcast announcements.</p>';
            return;
        }

        container.innerHTML = data.announcements.map(a => `
            <div style="padding: 1rem; border: 1px solid var(--border-light); border-radius: var(--radius-sm); position: relative; background: var(--bg);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <strong>${escapeHtml(a.title)}</strong>
                    <button onclick="deleteAnnouncement(${a.id})" class="btn btn-sm btn-outline-danger" title="Delete Announcement">
                        <i class="fas fa-trash-can"></i>
                    </button>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-dark); margin-bottom: 0.5rem; white-space: pre-line;">${escapeHtml(a.content)}</p>
                <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; gap: 1rem;">
                    <span>Priority: ${escapeHtml(a.priority)}</span>
                    <span>Category: ${escapeHtml(a.category)}</span>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Fetch announcements error:', err);
    }
}

async function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
        const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok && data.success) {
            fetchAdminAnnouncements();
        } else {
            alert(data.error || 'Delete failed.');
        }
    } catch (e) {
        alert('Delete failed.');
    }
}

// =============================================
// 5. ADMIN RESIDENT DIRECTORY HANDLER
// =============================================
async function loadAdminUsers() {
    const tbody = document.getElementById('usersTableBody');
    const badge = document.getElementById('userCountBadge');

    try {
        const res = await fetch('/api/admin/users');
        if (res.status === 401) {
            window.location.href = '/admin-login.html';
            return;
        }
        const data = await res.json();

        if (!data.success || !data.users || data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No resident profiles found.</td></tr>';
            return;
        }

        const users = data.users;
        badge.textContent = `${users.length} Active Residents`;

        tbody.innerHTML = users.map(u => `
            <tr style="border-bottom: 1px solid var(--border-light);">
                <td style="padding: 0.75rem;"><strong>${escapeHtml(u.full_name)}</strong></td>
                <td style="padding: 0.75rem;">${escapeHtml(u.phone || '-')}</td>
                <td style="padding: 0.75rem;">${escapeHtml(u.email || '-')}</td>
                <td style="padding: 0.75rem;">${escapeHtml(u.location)}</td>
                <td style="padding: 0.75rem;"><span class="badge badge-in-progress">${u.complaint_count} tickets</span></td>
                <td style="padding: 0.75rem;">${new Date(u.created_at).toLocaleDateString('en-IN')}</td>
            </tr>
        `).join('');

    } catch (err) {
        console.error('Load users error:', err);
    }
}

// =============================================
// 6. ADMIN REPORTS & ANALYTICS HANDLER
// =============================================
async function loadAdminReports() {
    try {
        const res = await fetch('/api/admin/reports');
        if (res.status === 401) {
            window.location.href = '/admin-login.html';
            return;
        }
        const data = await res.json();

        if (!data.success) return;

        const s = data.stats || {};
        const total = s.total || 0;
        const resolved = s.resolved || 0;
        const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        document.getElementById('reportResolutionRate').textContent = `${rate}%`;
        document.getElementById('reportTotal').textContent = total;
        document.getElementById('reportResolved').textContent = resolved;
        document.getElementById('reportPending').textContent = s.pending || 0;

        // Category breakdown table
        const catBody = document.getElementById('reportCategoryBody');
        if (data.byCategory && data.byCategory.length > 0) {
            catBody.innerHTML = data.byCategory.map(c => {
                const cRate = c.count > 0 ? Math.round(((c.resolved || 0) / c.count) * 100) : 0;
                return `
                    <tr style="border-bottom: 1px solid var(--border-light);">
                        <td style="padding: 0.5rem 0.75rem;"><strong>${escapeHtml(c.category)}</strong></td>
                        <td style="padding: 0.5rem 0.75rem;">${c.count}</td>
                        <td style="padding: 0.5rem 0.75rem; color: #10B981;">${c.resolved || 0}</td>
                        <td style="padding: 0.5rem 0.75rem;">${cRate}%</td>
                    </tr>
                `;
            }).join('');
        }

        // Department breakdown table
        const deptBody = document.getElementById('reportDepartmentBody');
        if (data.byDepartment && data.byDepartment.length > 0) {
            deptBody.innerHTML = data.byDepartment.map(d => {
                const dRate = d.count > 0 ? Math.round(((d.resolved || 0) / d.count) * 100) : 0;
                return `
                    <tr style="border-bottom: 1px solid var(--border-light);">
                        <td style="padding: 0.5rem 0.75rem;"><strong>${escapeHtml(d.department)}</strong></td>
                        <td style="padding: 0.5rem 0.75rem;">${d.count}</td>
                        <td style="padding: 0.5rem 0.75rem; color: #10B981;">${d.resolved || 0}</td>
                        <td style="padding: 0.5rem 0.75rem;">${dRate}%</td>
                    </tr>
                `;
            }).join('');
        }

        // Recent resolved tickets
        const resolvedBody = document.getElementById('reportRecentResolvedBody');
        if (data.recentResolved && data.recentResolved.length > 0) {
            resolvedBody.innerHTML = data.recentResolved.map(r => `
                <tr style="border-bottom: 1px solid var(--border-light);">
                    <td style="padding: 0.75rem; font-family: monospace; font-weight: 700; color: var(--primary);">${escapeHtml(r.complaint_id)}</td>
                    <td style="padding: 0.75rem;">${escapeHtml(r.title)}</td>
                    <td style="padding: 0.75rem;">${escapeHtml(r.category)}</td>
                    <td style="padding: 0.75rem;">${escapeHtml(r.user_name)}</td>
                    <td style="padding: 0.75rem;">${new Date(r.updated_at).toLocaleDateString('en-IN')}</td>
                </tr>
            `).join('');
        }

    } catch (err) {
        console.error('Load reports error:', err);
    }
}

// Helpers
function getStatusBadgeHtml(status) {
    const cls = getStatusBadgeClass(status);
    return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}

function getStatusBadgeClass(status) {
    if (status === 'Pending') return 'badge-pending';
    if (status === 'In Progress') return 'badge-in-progress';
    if (status === 'Resolved') return 'badge-resolved';
    if (status === 'Rejected') return 'badge-rejected';
    return 'badge-pending';
}
