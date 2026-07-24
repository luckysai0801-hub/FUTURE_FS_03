// =============================================
// admin.js - Society Manager Admin Panel Operations API
// Skyline Residency – Smart Apartment Portal
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Dashboard Overview Stats & Data Loader
    if (window.location.pathname.includes('dashboard') || window.location.pathname === '/admin') {
        loadDashboardData();
    }

    // 2. Manage Complaints Queue Loader
    if (window.location.pathname.includes('admin-complaints')) {
        loadComplaintsList();

        const searchInput = document.getElementById('searchQuery');
        const statusSelect = document.getElementById('statusFilter');
        const categorySelect = document.getElementById('categoryFilter');

        if (searchInput) searchInput.addEventListener('input', debounce(loadComplaintsList, 300));
        if (statusSelect) statusSelect.addEventListener('change', loadComplaintsList);
        if (categorySelect) categorySelect.addEventListener('change', loadComplaintsList);
    }

    // 3. Complaint Detail View Loader
    if (window.location.pathname.includes('admin-complaint-detail')) {
        const urlParams = new URLSearchParams(window.location.search);
        const ticketId = urlParams.get('id');
        if (ticketId) loadComplaintDetail(ticketId);
    }

    // 4. Announcements Manager Loader
    if (window.location.pathname.includes('admin-announcements')) {
        loadAdminAnnouncements();

        const form = document.getElementById('createAnnouncementForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const title = document.getElementById('announcementTitle').value.trim();
                const category = document.getElementById('announcementCategory').value;
                const priority = document.getElementById('announcementPriority').value;
                const content = document.getElementById('announcementContent').value.trim();

                try {
                    const res = await fetch('/api/admin/announcements', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title, category, priority, content })
                    });
                    const data = await res.json();
                    if (data.success) {
                        form.reset();
                        loadAdminAnnouncements();
                    } else {
                        alert(data.error || 'Failed to broadcast announcement.');
                    }
                } catch (err) {
                    console.error('Create Announcement Error:', err);
                }
            });
        }
    }

    // 5. Resident Directory Loader
    if (window.location.pathname.includes('admin-users')) {
        loadResidentDirectory();
    }

    // 6. Reports & Analytics Loader
    if (window.location.pathname.includes('admin-reports')) {
        loadReportsData();
    }
});

// Helper: Fetch Dashboard Stats
async function loadDashboardData() {
    try {
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();

        if (data.success && data.stats) {
            setElemText('statTotal', data.stats.total || 0);
            setElemText('statPending', data.stats.pending || 0);
            setElemText('statInProgress', data.stats.in_progress || 0);
            setElemText('statResolved', data.stats.resolved || 0);
            setElemText('statRejected', data.stats.rejected || 0);
            setElemText('statUsers', data.stats.totalUsers || 0);

            // Recent complaints table
            const recentTableBody = document.getElementById('recentComplaintsBody');
            if (recentTableBody && data.recentComplaints) {
                if (data.recentComplaints.length === 0) {
                    recentTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No recent complaints found.</td></tr>';
                } else {
                    recentTableBody.innerHTML = data.recentComplaints.map(c => `
                        <tr>
                            <td><strong style="font-family: monospace; color: var(--primary);">${c.complaint_id}</strong></td>
                            <td>${c.resident_name} (${c.flat_number})</td>
                            <td>${c.category}</td>
                            <td><span class="badge badge-${c.status.toLowerCase().replace(/\s+/g, '-')}">${c.status}</span></td>
                            <td>${new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                            <td>
                                <a href="/admin-complaint-detail.html?id=${c.id}" class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-eye"></i> View
                                </a>
                            </td>
                        </tr>
                    `).join('');
                }
            }

            // Category breakdown bars
            const breakdownElem = document.getElementById('categoryBreakdown');
            if (breakdownElem && data.byCategory) {
                const maxCount = Math.max(...data.byCategory.map(x => x.count), 1);
                breakdownElem.innerHTML = data.byCategory.map(cat => `
                    <div style="margin-bottom: 0.85rem;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.25rem;">
                            <span>${cat.category}</span>
                            <span>${cat.count} ticket${cat.count > 1 ? 's' : ''}</span>
                        </div>
                        <div style="height: 8px; background: #F1F5F9; border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${(cat.count / maxCount) * 100}%; background: var(--primary); border-radius: 4px;"></div>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Load Dashboard Error:', err);
    }
}

// Helper: Fetch Complaints List Queue
async function loadComplaintsList() {
    const listBody = document.getElementById('complaintsTableBody');
    if (!listBody) return;

    const search = (document.getElementById('searchQuery')?.value || '').trim();
    const status = document.getElementById('statusFilter')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || '';

    try {
        const queryParams = new URLSearchParams({ search, status, category });
        const res = await fetch(`/api/admin/complaints?${queryParams.toString()}`);
        const data = await res.json();

        if (data.success && data.complaints) {
            if (data.complaints.length === 0) {
                listBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">No complaint records matching current filters.</td></tr>';
            } else {
                listBody.innerHTML = data.complaints.map(c => `
                    <tr>
                        <td><strong style="font-family: monospace; color: var(--primary);">${c.complaint_id}</strong></td>
                        <td>
                            <strong>${c.resident_name}</strong><br>
                            <span style="font-size: 0.78rem; color: var(--text-muted);">${c.flat_number} (${c.block_wing})</span>
                        </td>
                        <td>${c.category}</td>
                        <td><span class="badge badge-${c.status.toLowerCase().replace(/\s+/g, '-')}">${c.status}</span></td>
                        <td><span style="font-weight:700; color: ${c.priority === 'High' ? '#EF4444' : (c.priority === 'Medium' ? '#F59E0B' : '#10B981')};">${c.priority}</span></td>
                        <td>${new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                        <td>
                            <div style="display:flex; gap:0.4rem;">
                                <a href="/admin-complaint-detail.html?id=${c.id}" class="btn btn-sm btn-outline-primary" title="View Detail">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <button onclick="openStatusModal(${c.id}, '${c.status}', '${(c.admin_remarks || '').replace(/'/g, "\\'")}')" class="btn btn-sm btn-primary" title="Update Status">
                                    <i class="fas fa-pen-to-square"></i>
                                </button>
                                <button onclick="deleteTicket(${c.id})" class="btn btn-sm btn-outline-danger" title="Delete Ticket">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Load Complaints Error:', err);
    }
}

// Helper: Status Update Modal Controls
function openStatusModal(ticketId, currentStatus, currentRemarks) {
    const modal = document.getElementById('statusModal');
    const idInput = document.getElementById('modalTicketId');
    const statusSelect = document.getElementById('modalStatus');
    const remarksInput = document.getElementById('modalRemarks');

    if (modal && idInput && statusSelect) {
        idInput.value = ticketId;
        statusSelect.value = currentStatus;
        if (remarksInput) remarksInput.value = currentRemarks || '';
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('statusModal');
    if (modal) modal.style.display = 'none';
}

async function submitStatusUpdate() {
    const ticketId = document.getElementById('modalTicketId')?.value;
    const new_status = document.getElementById('modalStatus')?.value;
    const remarks = document.getElementById('modalRemarks')?.value;

    if (!ticketId || !new_status) return;

    try {
        const res = await fetch(`/api/admin/complaints/${ticketId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_status, remarks })
        });
        const data = await res.json();
        if (data.success) {
            closeModal();
            if (window.location.pathname.includes('admin-complaint-detail')) {
                loadComplaintDetail(ticketId);
            } else {
                loadComplaintsList();
            }
        } else {
            alert(data.error || 'Failed to update ticket status.');
        }
    } catch (err) {
        console.error('Update Status Error:', err);
    }
}

async function deleteTicket(ticketId) {
    if (!confirm('Are you sure you want to delete this complaint record permanently?')) return;

    try {
        const res = await fetch(`/api/admin/complaints/${ticketId}/delete`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            loadComplaintsList();
        } else {
            alert(data.error || 'Failed to delete record.');
        }
    } catch (err) {
        console.error('Delete Ticket Error:', err);
    }
}

// Helper: Load Single Complaint Detail
async function loadComplaintDetail(ticketId) {
    try {
        const res = await fetch(`/api/admin/complaints/${ticketId}`);
        const data = await res.json();

        if (data.success && data.complaint) {
            const c = data.complaint;
            setElemText('detailTicketId', c.complaint_id);
            setElemText('detailResident', `${c.resident_name} (${c.flat_number}, ${c.block_wing})`);
            setElemText('detailContact', `${c.mobile_number} | ${c.email || 'No email provided'}`);
            setElemText('detailCategory', c.category);
            setElemText('detailTitle', c.title);
            setElemText('detailDescription', c.description);
            setElemText('detailAssignedTo', c.assigned_to || 'Unassigned');
            setElemText('detailRemarks', c.admin_remarks || 'No notes posted.');
            setElemText('detailDate', new Date(c.created_at).toLocaleString('en-IN'));

            const statusBadge = document.getElementById('detailStatusBadge');
            if (statusBadge) {
                statusBadge.innerText = c.status;
                statusBadge.className = `badge badge-${c.status.toLowerCase().replace(/\s+/g, '-')}`;
            }

            const assignedInput = document.getElementById('assignedToInput');
            if (assignedInput) assignedInput.value = c.assigned_to || '';
            const remarksInput = document.getElementById('adminRemarksInput');
            if (remarksInput) remarksInput.value = c.admin_remarks || '';

            // Image attachment preview
            const imageElem = document.getElementById('detailImage');
            const imageLink = document.getElementById('detailImageLink');
            const imageWrap = document.getElementById('imageWrap');
            if (c.image_path && imageElem && imageWrap) {
                imageElem.src = c.image_path;
                if (imageLink) imageLink.href = c.image_path;
                imageWrap.style.display = 'block';
            } else if (imageWrap) {
                imageWrap.style.display = 'none';
            }

            // Render Timeline
            const timelineElem = document.getElementById('detailTimeline');
            if (timelineElem && data.updates) {
                timelineElem.innerHTML = data.updates.map(u => `
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-time">${new Date(u.updated_at).toLocaleString('en-IN')}</div>
                            <div class="timeline-title">Status changed to "${u.new_status}"</div>
                            <p style="font-size:0.85rem; color: var(--text-muted); margin-top:0.25rem;">
                                ${u.remarks ? `Remarks: ${u.remarks}` : 'No remarks posted.'}
                            </p>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Load Detail Error:', err);
    }
}

// Helper: Save Ticket Details (Staff Assignment & Remarks)
async function saveTicketDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get('id');
    const assigned_to = document.getElementById('assignedToInput')?.value;
    const admin_remarks = document.getElementById('adminRemarksInput')?.value;

    if (!ticketId) return;

    try {
        const res = await fetch(`/api/admin/complaints/${ticketId}/details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assigned_to, admin_remarks })
        });
        const data = await res.json();
        if (data.success) {
            alert('Staff assignment & management notes saved successfully!');
            loadComplaintDetail(ticketId);
        } else {
            alert(data.error || 'Failed to update details.');
        }
    } catch (err) {
        console.error('Save Details Error:', err);
    }
}

// Helper: Load Admin Announcements Table
async function loadAdminAnnouncements() {
    const tbody = document.getElementById('adminAnnouncementsBody');
    if (!tbody) return;

    try {
        const res = await fetch('/api/admin/announcements');
        const data = await res.json();

        if (data.success && data.announcements) {
            tbody.innerHTML = data.announcements.map(a => `
                <tr>
                    <td><strong>${a.title}</strong></td>
                    <td><span class="badge badge-in-progress">${a.category || 'Notice'}</span></td>
                    <td><span style="font-weight:700; color: ${a.priority === 'High' ? '#EF4444' : '#10B981'};">${a.priority || 'Medium'}</span></td>
                    <td>${new Date(a.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                        <button onclick="deleteAnnouncement(${a.id})" class="btn btn-sm btn-outline-danger">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('Load Admin Announcements Error:', err);
    }
}

async function deleteAnnouncement(id) {
    if (!confirm('Delete this announcement notice?')) return;
    try {
        const res = await fetch(`/api/admin/announcements/${id}/delete`, { method: 'POST' });
        const data = await res.json();
        if (data.success) loadAdminAnnouncements();
    } catch (err) {
        console.error('Delete Announcement Error:', err);
    }
}

// Helper: Load Resident Directory
async function loadResidentDirectory() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();

        if (data.success && data.users) {
            tbody.innerHTML = data.users.map(u => `
                <tr>
                    <td><strong>${u.full_name}</strong></td>
                    <td>${u.location}</td>
                    <td>${u.phone}</td>
                    <td>${u.email || 'N/A'}</td>
                    <td><span class="badge badge-in-progress">${u.complaint_count} ticket${u.complaint_count > 1 ? 's' : ''}</span></td>
                    <td>${new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('Load Resident Directory Error:', err);
    }
}

// Helper: Load Reports Data
async function loadReportsData() {
    try {
        const res = await fetch('/api/admin/reports');
        const data = await res.json();

        if (data.success && data.stats) {
            const total = data.stats.total || 1;
            const resolved = data.stats.resolved || 0;
            const resPercent = Math.round((resolved / total) * 100);

            setElemText('reportTotal', total);
            setElemText('reportResolved', resolved);
            setElemText('reportPending', data.stats.pending || 0);
            setElemText('reportRatePercent', `${resPercent}%`);

            const barElem = document.getElementById('resolutionProgressBar');
            if (barElem) barElem.style.width = `${resPercent}%`;
        }
    } catch (err) {
        console.error('Load Reports Error:', err);
    }
}

function setElemText(id, val) {
    const elem = document.getElementById(id);
    if (elem) elem.innerText = val;
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
