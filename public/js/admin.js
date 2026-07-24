// =============================================
// admin.js - Society Manager Admin Panel Scripts
// Skyline Residency – Smart Apartment Portal
// =============================================

document.addEventListener('DOMContentLoaded', function () {

    const statusForm = document.getElementById('statusForm');
    if (statusForm) {
        statusForm.addEventListener('submit', function (e) {
            const newStatus = this.querySelector('select[name="new_status"]').value;
            const confirmed = confirm(`Confirm updating maintenance request status to "${newStatus}"?\nThis status update will be logged in the resident's ticket audit timeline.`);
            if (!confirmed) e.preventDefault();
        });
    }

    const tableSearchInput = document.getElementById('tableSearch');
    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('.custom-table tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
});
