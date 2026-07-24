// =============================================
// public/js/complaints.js
// Handles Complaint Registration & Tracking via REST API
// Skyline Residency – Smart Apartment Portal
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. COMPLAINT REGISTRATION FORM
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('submitBtn');
            const alertContainer = document.getElementById('alertContainer');
            const formCard = document.getElementById('formCard');
            const successCard = document.getElementById('successCard');
            const generatedId = document.getElementById('generatedId');
            const trackLinkBtn = document.getElementById('trackLinkBtn');

            // Form validation
            const residentName = document.getElementById('resident_name').value.trim();
            const mobileNumber = document.getElementById('mobile_number').value.trim();
            const blockWing = document.getElementById('block_wing').value;
            const flatNumber = document.getElementById('flat_number').value.trim();
            const category = document.getElementById('category').value;
            const priority = document.getElementById('priority').value;
            const title = document.getElementById('title').value.trim();
            const description = document.getElementById('description').value.trim();

            if (!residentName || !mobileNumber || !blockWing || !flatNumber || !category || !title || !description) {
                showAlert('Please fill in all required fields.', 'error');
                return;
            }

            if (!/^[0-9]{10}$/.test(mobileNumber)) {
                showAlert('Please enter a valid 10-digit mobile number.', 'error');
                return;
            }

            if (description.length < 20) {
                showAlert('Complaint Description must be at least 20 characters long.', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Request...';

            const formData = new FormData(complaintForm);

            try {
                const res = await fetch('/api/complaints', {
                    method: 'POST',
                    body: formData
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    formCard.style.display = 'none';
                    successCard.style.display = 'block';
                    generatedId.textContent = data.complaintId;
                    trackLinkBtn.href = `/track.html?id=${data.complaintId}`;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    showAlert(data.error || 'Failed to submit complaint. Please check your inputs.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Ticket Now';
                }

            } catch (err) {
                console.error('Submit error:', err);
                showAlert('Server communication error. Please try again.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Ticket Now';
            }
        });
    }

    // 2. TRACK COMPLAINT SEARCH & AUTO LOAD
    const trackSearchForm = document.getElementById('trackSearchForm');
    const searchIdInput = document.getElementById('searchIdInput');

    if (searchIdInput) {
        // Read URL query parameter ?id=...
        const urlParams = new URLSearchParams(window.location.search);
        const queryId = urlParams.get('id');
        if (queryId) {
            searchIdInput.value = queryId;
            performTrackLookup(queryId);
        }

        if (trackSearchForm) {
            trackSearchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = searchIdInput.value.trim();
                if (id) {
                    // Update URL without full page refresh
                    window.history.pushState({}, '', `/track.html?id=${encodeURIComponent(id)}`);
                    performTrackLookup(id);
                }
            });
        }
    }

});

// Perform Complaint Lookup via REST API
async function performTrackLookup(complaintId) {
    const trackAlert = document.getElementById('trackAlert');
    const ticketResult = document.getElementById('ticketResult');

    trackAlert.style.display = 'none';
    ticketResult.style.display = 'none';

    try {
        const res = await fetch(`/api/complaints/track?id=${encodeURIComponent(complaintId)}`);
        const data = await res.json();

        if (!res.ok || !data.success || !data.complaint) {
            trackAlert.style.display = 'block';
            trackAlert.innerHTML = `
                <div style="background: #FEE2E2; color: #DC2626; border: 1px solid #FECACA; padding: 1rem 1.5rem; border-radius: var(--radius-md); text-align: center;">
                    <i class="fas fa-circle-exclamation fa-2x" style="margin-bottom: 0.5rem;"></i>
                    <p style="margin: 0; font-weight: 600;">${data.error || 'No complaint record found matching ID: "' + complaintId + '".'}</p>
                </div>
            `;
            return;
        }

        const c = data.complaint;
        const updates = data.updates || [];

        // Render ticket details
        document.getElementById('ticketIdBadge').textContent = c.complaint_id;
        document.getElementById('ticketTitle').textContent = c.title;
        document.getElementById('ticketCategory').innerHTML = `<i class="fas fa-layer-group"></i> ${c.category}`;
        document.getElementById('ticketResident').textContent = c.resident_name;
        document.getElementById('ticketLocation').textContent = `${c.block_wing} - ${c.flat_number}`;
        document.getElementById('ticketAssigned').textContent = c.assigned_to || 'Pending Management Assignment';
        document.getElementById('ticketSubmittedDate').textContent = new Date(c.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        document.getElementById('ticketDescription').textContent = c.description;

        // Status Badge
        const statusBadge = document.getElementById('ticketStatusBadge');
        statusBadge.textContent = c.status;
        statusBadge.className = 'badge ';
        if (c.status === 'Pending') statusBadge.className += 'badge-pending';
        else if (c.status === 'In Progress') statusBadge.className += 'badge-in-progress';
        else if (c.status === 'Resolved') statusBadge.className += 'badge-resolved';
        else if (c.status === 'Rejected') statusBadge.className += 'badge-rejected';

        // Priority Badge
        const priorityBadge = document.getElementById('ticketPriorityBadge');
        priorityBadge.textContent = `${c.priority || 'Medium'} Priority`;
        priorityBadge.style.background = c.priority === 'High' ? '#FEE2E2' : '#E0E7FF';
        priorityBadge.style.color = c.priority === 'High' ? '#DC2626' : '#3730A3';

        // Manager Remarks
        const remarksSec = document.getElementById('adminRemarksSection');
        if (c.admin_remarks) {
            remarksSec.style.display = 'block';
            document.getElementById('ticketAdminRemarks').textContent = c.admin_remarks;
        } else {
            remarksSec.style.display = 'none';
        }

        // Image Attachment
        const imgSec = document.getElementById('imageSection');
        if (c.image_path) {
            imgSec.style.display = 'block';
            document.getElementById('ticketImage').src = c.image_path;
            document.getElementById('imageLink').href = c.image_path;
        } else {
            imgSec.style.display = 'none';
        }

        // Timeline steps
        renderStepTimeline(c.status);

        // Audit Trail updates list
        renderAuditTimeline(updates);

        ticketResult.style.display = 'block';

    } catch (err) {
        console.error('Track lookup error:', err);
        trackAlert.style.display = 'block';
        trackAlert.innerHTML = `
            <div style="background: #FEE2E2; color: #DC2626; padding: 1rem; border-radius: var(--radius-md); text-align: center;">
                Network error loading tracking details.
            </div>
        `;
    }
}

function renderStepTimeline(status) {
    const container = document.getElementById('stepTimeline');
    const isPending = status === 'Pending';
    const isInProgress = status === 'In Progress';
    const isResolved = status === 'Resolved';
    const isRejected = status === 'Rejected';

    container.innerHTML = `
        <div style="text-align: center; flex: 1; position: relative; z-index: 1;">
            <div style="width: 36px; height: 36px; background: #10B981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem auto;">
                <i class="fas fa-check"></i>
            </div>
            <strong style="font-size: 0.85rem; display: block;">Ticket Received</strong>
            <small style="color: var(--text-muted); font-size: 0.75rem;">Logged in System</small>
        </div>

        <div style="text-align: center; flex: 1; position: relative; z-index: 1;">
            <div style="width: 36px; height: 36px; background: ${isInProgress || isResolved ? '#3B82F6' : (isRejected ? '#EF4444' : '#E2E8F0')}; color: ${isInProgress || isResolved || isRejected ? 'white' : '#64748B'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem auto;">
                <i class="fas ${isRejected ? 'fa-xmark' : 'fa-screwdriver-wrench'}"></i>
            </div>
            <strong style="font-size: 0.85rem; display: block;">Work Order Dispatch</strong>
            <small style="color: var(--text-muted); font-size: 0.75rem;">${isInProgress ? 'Staff Dispatched' : (isRejected ? 'Ticket Rejected' : 'Pending Review')}</small>
        </div>

        <div style="text-align: center; flex: 1; position: relative; z-index: 1;">
            <div style="width: 36px; height: 36px; background: ${isResolved ? '#10B981' : (isRejected ? '#EF4444' : '#E2E8F0')}; color: ${isResolved || isRejected ? 'white' : '#64748B'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem auto;">
                <i class="fas ${isResolved ? 'fa-flag-checkered' : (isRejected ? 'fa-ban' : 'fa-hourglass-half')}"></i>
            </div>
            <strong style="font-size: 0.85rem; display: block;">Final Sign-Off</strong>
            <small style="color: var(--text-muted); font-size: 0.75rem;">${isResolved ? 'Issue Resolved' : (isRejected ? 'Closed' : 'Awaiting Fix')}</small>
        </div>
    `;
}

function renderAuditTimeline(updates) {
    const container = document.getElementById('updatesTimeline');
    if (!updates || updates.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); background: var(--bg); border-radius: var(--radius-sm);">
                <i class="fas fa-info-circle"></i> Ticket logged. Pending first review by Society Manager.
            </div>
        `;
        return;
    }

    container.innerHTML = updates.map(u => {
        const timeStr = new Date(u.updated_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return `
            <div style="padding: 1rem; border-left: 3px solid var(--primary); background: var(--bg); border-radius: var(--radius-sm); margin-bottom: 0.85rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                    <div>
                        <strong style="color: var(--primary); font-size: 0.9rem;">
                            Status updated: <span class="badge badge-in-progress">${escapeHtml(u.old_status || 'Pending')}</span> &rarr; <span class="badge badge-resolved">${escapeHtml(u.new_status)}</span>
                        </strong>
                    </div>
                    <small style="color: var(--text-muted);"><i class="far fa-clock"></i> ${timeStr}</small>
                </div>
                ${u.remarks ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: var(--text-dark); background: white; padding: 0.5rem 0.75rem; border-radius: var(--radius-xs); border: 1px solid var(--border-light);"><i class="fas fa-comment-dots" style="color: var(--primary);"></i> ${escapeHtml(u.remarks)}</p>` : ''}
                <small style="color: var(--text-muted); display: block; margin-top: 0.35rem;">Updated by: ${escapeHtml(u.updated_by_name || 'Society Manager')}</small>
            </div>
        `;
    }).join('');
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


function resetForm() {
    document.getElementById('complaintForm').reset();
    document.getElementById('formCard').style.display = 'block';
    document.getElementById('successCard').style.display = 'none';
}

function showAlert(message, type = 'error') {
    const container = document.getElementById('alertContainer');
    if (!container) return;

    const isSuccess = type === 'success';
    container.style.display = 'block';
    container.innerHTML = `
        <div style="background: ${isSuccess ? '#D1FAE5' : '#FEE2E2'}; color: ${isSuccess ? '#059669' : '#DC2626'}; border: 1px solid ${isSuccess ? '#A7F3D0' : '#FECACA'}; padding: 0.85rem 1.25rem; border-radius: var(--radius-sm); font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center;">
            <div><i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}" style="margin-right: 8px;"></i> ${message}</div>
            <button onclick="this.parentElement.parentElement.style.display='none'" style="background: none; border: none; cursor: pointer; color: inherit;"><i class="fas fa-times"></i></button>
        </div>
    `;
}
