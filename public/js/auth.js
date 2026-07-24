// =============================================
// public/js/auth.js
// Handles Admin Login Form Submission & Authentication via REST API
// Skyline Residency – Smart Apartment Portal
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (!adminLoginForm) return;

    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const alertContainer = document.getElementById('loginAlert');
        const submitBtn = document.getElementById('loginSubmitBtn');

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showAlert('Please enter both email and password.', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showAlert(data.message || 'Login successful! Redirecting to dashboard...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 800);
            } else {
                showAlert(data.error || 'Invalid credentials.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-right-to-bracket"></i> Sign In to Admin Panel';
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('A network error occurred. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-right-to-bracket"></i> Sign In to Admin Panel';
        }
    });
});

function showAlert(message, type = 'error') {
    const container = document.getElementById('loginAlert');
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
