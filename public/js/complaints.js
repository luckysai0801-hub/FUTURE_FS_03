// =============================================
// complaints.js - Public Complaint Submission & Tracking API
// Skyline Residency – Smart Apartment Portal
// =============================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. Complaint Submission Form Handler
    const complaintForm = document.getElementById('complaintForm');
    const alertContainer = document.getElementById('alertContainer');
    const successCard = document.getElementById('successCard');
    const formCard = document.getElementById('formCard');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const fileUploadArea = document.getElementById('fileUploadArea');

    // Drag-and-Drop Image Upload Handler
    if (fileUploadArea && imageInput) {
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('drag-over');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('drag-over');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                imageInput.files = e.dataTransfer.files;
                showImagePreview(e.dataTransfer.files[0]);
            }
        });

        imageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                showImagePreview(e.target.files[0]);
            }
        });
    }

    function showImagePreview(file) {
        if (file && imagePreview) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    if (complaintForm) {
        complaintForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showAlert('', false); // Clear alert

            const submitBtn = complaintForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                }

                const formData = new FormData(complaintForm);

                const res = await fetch('/api/complaints', {
                    method: 'POST',
                    body: formData
                });

                const data = await res.json();

                if (data.success) {
                    if (formCard) formCard.style.display = 'none';
                    if (successCard) {
                        const generatedIdElem = document.getElementById('generatedId');
                        if (generatedIdElem) generatedIdElem.innerText = data.complaintId;
                        const trackBtn = document.getElementById('trackLinkBtn');
                        if (trackBtn) trackBtn.href = `/track.html?id=${data.complaintId}`;
                        successCard.style.display = 'block';
                        successCard.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    showAlert(data.error || 'Failed to register complaint. Please check form fields.', true);
                }

            } catch (err) {
                console.error('Submission Error:', err);
                showAlert('Network or server error while submitting complaint. Please try again.', true);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    // 2. Complaint Tracking Lookup Handler
    const trackForm = document.getElementById('trackForm');
    const trackResult = document.getElementById('trackResult');
    const trackError = document.getElementById('trackError');

    // Auto-search if Complaint ID passed in URL query string (e.g. ?id=CMP-2026-000101)
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id');
    if (queryId) {
        const idInput = document.getElementById('trackComplaintId');
        if (idInput) idInput.value = queryId;
        performTrackLookup(queryId);
    }

    if (trackForm) {
        trackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const idInput = document.getElementById('trackComplaintId');
            if (idInput && idInput.value.trim()) {
                performTrackLookup(idInput.value.trim());
            }
        });
    }

    async function performTrackLookup(complaintId) {
        if (!trackResult) return;
        hideTrackError();

        try {
            const res = await fetch(`/api/track?id=${encodeURIComponent(complaintId)}`);
            const data = await res.json();

            if (data.success && data.complaint) {
                renderComplaintDetails(data.complaint, data.updates || []);
                trackResult.style.display = 'block';
                trackResult.scrollIntoView({ behavior: 'smooth' });
            } else {
                trackResult.style.display = 'none';
                showTrackError(data.error || `No complaint record found matching ID "${complaintId}".`);
            }
        } catch (err) {
            console.error('Tracking Error:', err);
            trackResult.style.display = 'none';
            showTrackError('Error connecting to status server. Please try again.');
        }
    }

    function renderComplaintDetails(c, updates) {
        // Basic Fields
        setElementText('detailComplaintId', c.complaint_id);
        setElementText('detailResidentName', c.resident_name);
        setElementText('detailFlatNumber', c.flat_number);
        setElementText('detailMobileNumber', c.mobile_number);
        setElementText('detailBlock', c.block_wing);
        setElementText('detailCategory', c.category);
        setElementText('detailTitle', c.title);
        setElementText('detailDescription', c.description);
        setElementText('detailAssignedTo', c.assigned_to || 'Pending Staff Assignment');
        setElementText('detailRemarks', c.admin_remarks || 'No management notes posted yet.');
        setElementText('detailDate', new Date(c.created_at).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }));

        // Status Badge
        const statusBadge = document.getElementById('detailStatusBadge');
        if (statusBadge) {
            statusBadge.innerText = c.status;
            statusBadge.className = `badge badge-${c.status.toLowerCase().replace(/\s+/g, '-')}`;
        }

        // Priority Badge
        const priorityBadge = document.getElementById('detailPriorityBadge');
        if (priorityBadge) {
            priorityBadge.innerText = `${c.priority} Priority`;
        }

        // Image Attachment
        const imageContainer = document.getElementById('detailImageContainer');
        const imageElem = document.getElementById('detailImage');
        const imageLink = document.getElementById('imageLink');
        if (c.image_path && imageContainer && imageElem) {
            imageElem.src = c.image_path;
            if (imageLink) imageLink.href = c.image_path;
            imageContainer.style.display = 'block';
        } else if (imageContainer) {
            imageContainer.style.display = 'none';
        }

        // Timeline Updates
        const timelineContainer = document.getElementById('detailTimeline');
        if (timelineContainer) {
            if (updates && updates.length > 0) {
                timelineContainer.innerHTML = updates.map(u => `
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-time">${new Date(u.updated_at).toLocaleString('en-IN')}</div>
                            <div class="timeline-title">Status changed from "${u.old_status}" to "${u.new_status}"</div>
                            <p style="margin-top: 0.25rem; font-size: 0.85rem; color: var(--text-muted);">
                                ${u.remarks ? `<strong>Remarks:</strong> ${u.remarks}` : 'No additional remarks.'}
                            </p>
                            <span style="font-size: 0.75rem; color: var(--primary); font-weight: 600;">Updated by ${u.updated_by_name || 'Society Admin'}</span>
                        </div>
                    </div>
                `).join('');
            } else {
                timelineContainer.innerHTML = `
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-time">${new Date(c.created_at).toLocaleString('en-IN')}</div>
                            <div class="timeline-title">Complaint Created & Ticket Dispatched</div>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
                                Ticket registered and awaiting initial manager review.
                            </p>
                        </div>
                    </div>
                `;
            }
        }
    }

    function setElementText(id, text) {
        const elem = document.getElementById(id);
        if (elem) elem.innerText = text;
    }

    function showAlert(msg, isError) {
        if (!alertContainer) return;
        if (!msg) {
            alertContainer.style.display = 'none';
            return;
        }
        alertContainer.innerHTML = `
            <div style="background: ${isError ? '#FEE2E2' : '#D1FAE5'}; color: ${isError ? '#991B1B' : '#065F46'}; border: 1px solid ${isError ? '#FCA5A5' : '#6EE7B7'}; padding: 1rem 1.25rem; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 600;">
                <i class="fas ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> ${msg}
            </div>
        `;
        alertContainer.style.display = 'block';
        alertContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function showTrackError(msg) {
        if (!trackError) return;
        trackError.innerText = msg;
        trackError.style.display = 'block';
    }

    function hideTrackError() {
        if (!trackError) return;
        trackError.style.display = 'none';
    }
});

function resetForm() {
    const form = document.getElementById('complaintForm');
    const formCard = document.getElementById('formCard');
    const successCard = document.getElementById('successCard');
    const imagePreview = document.getElementById('imagePreview');

    if (form) form.reset();
    if (imagePreview) imagePreview.style.display = 'none';
    if (successCard) successCard.style.display = 'none';
    if (formCard) formCard.style.display = 'block';
}
