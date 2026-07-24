// =============================================
// auth.js - Admin Authentication API & Toggle JS
// Skyline Residency – Smart Apartment Portal
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Password Visibility Toggle
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            
            const icon = togglePasswordBtn.querySelector('i');
            if (icon) {
                icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
            }
        });
    }

    // 2. Admin Login Form Handler
    const adminLoginForm = document.getElementById('adminLoginForm');
    const loginAlert = document.getElementById('loginAlert');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAlert();

            const emailInput = document.getElementById('email');
            const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Login';

            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!email || !password) {
                showAlert('Please enter both admin email and password.');
                return;
            }

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
                }

                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (data.success) {
                    window.location.href = '/dashboard.html';
                } else {
                    showAlert(data.error || 'Invalid admin credentials. Please try again.');
                }
            } catch (err) {
                console.error('Login Error:', err);
                showAlert('Network error connecting to authentication server.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    function showAlert(msg) {
        if (!loginAlert) return;
        loginAlert.innerHTML = `
            <div style="background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; padding: 0.85rem 1.1rem; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 600; margin-bottom: 1.25rem;">
                <i class="fas fa-circle-exclamation"></i> ${msg}
            </div>
        `;
        loginAlert.style.display = 'block';
    }

    function hideAlert() {
        if (!loginAlert) return;
        loginAlert.style.display = 'none';
    }
});
