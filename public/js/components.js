// =============================================
// public/js/components.js
// Dynamic Reusable Components Injector (Navbar, Footer, Admin Sidebar)
// Skyline Residency – Smart Apartment Portal
// =============================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check current admin auth state
    let currentUser = null;
    try {
        const res = await fetch('/api/auth/check');
        if (res.ok) {
            const data = await res.json();
            if (data && data.authenticated && data.user) {
                currentUser = data.user;
            }
        }
    } catch (e) {
        console.warn('Auth check skipped or failed:', e);
    }

    const path = window.location.pathname;

    // 2. Render Header Navbar if #app-navbar container exists
    const navbarContainer = document.getElementById('app-navbar');
    if (navbarContainer) {
        const isHome = path === '/' || path.endsWith('/index.html') || path === '/index';
        const isNewComplaint = path.includes('/complaint');
        const isTrack = path.includes('/track');
        const isAnnouncements = path.includes('/announcements');
        const isContact = path.includes('/contact');
        const isAdminPage = path.includes('dashboard') || path.includes('admin');

        navbarContainer.innerHTML = `
            <nav class="navbar" id="mainNav">
                <div class="nav-container">
                    <a href="/index.html" class="nav-brand">
                        <i class="fas fa-building-user"></i>
                        <span>Skyline Residency</span>
                        <span class="brand-badge">PORTAL</span>
                    </a>

                    <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
                        <i class="fas fa-bars"></i>
                    </button>

                    <div class="nav-links" id="navLinks">
                        <a href="/index.html" class="nav-link ${isHome ? 'active' : ''}">
                            <i class="fas fa-home"></i> Home
                        </a>
                        <a href="/complaint.html" class="nav-link ${isNewComplaint ? 'active' : ''}">
                            <i class="fas fa-paper-plane"></i> Submit Complaint
                        </a>
                        <a href="/track.html" class="nav-link ${isTrack ? 'active' : ''}">
                            <i class="fas fa-magnifying-glass"></i> Track Status
                        </a>
                        <a href="/announcements.html" class="nav-link ${isAnnouncements ? 'active' : ''}">
                            <i class="fas fa-bullhorn"></i> Notices
                        </a>
                        <a href="/contact.html" class="nav-link ${isContact ? 'active' : ''}">
                            <i class="fas fa-headset"></i> Contact
                        </a>
                        ${currentUser ? `
                            <a href="/dashboard.html" class="btn btn-sm btn-primary ${isAdminPage ? 'active' : ''}">
                                <i class="fas fa-chart-line"></i> Admin Portal
                            </a>
                            <button id="globalLogoutBtn" class="btn btn-sm btn-outline-danger" style="margin-left: 0.5rem;">
                                <i class="fas fa-right-from-bracket"></i> Logout
                            </button>
                        ` : `
                            <a href="/admin-login.html" class="btn btn-sm btn-outline-primary" style="margin-left: 0.5rem;">
                                <i class="fas fa-lock"></i> Admin Login
                            </a>
                        `}
                    </div>
                </div>
            </nav>
        `;

        const toggler = document.getElementById('navToggle');
        const menu = document.getElementById('navLinks');
        if (toggler && menu) {
            toggler.addEventListener('click', () => {
                menu.classList.toggle('open');
            });
        }
    }

    // 3. Render Admin Sidebar if #app-admin-sidebar container exists
    const adminSidebarContainer = document.getElementById('app-admin-sidebar');
    if (adminSidebarContainer) {
        const isDashboard = path.includes('dashboard') || path === '/admin';
        const isComplaints = path.includes('complaint');
        const isAnnouncements = path.includes('announcement');
        const isUsers = path.includes('user');
        const isReports = path.includes('report');

        adminSidebarContainer.innerHTML = `
            <aside class="sidebar admin-sidebar" id="sidebar">
                <div class="sidebar-logo">
                    <div class="sidebar-logo-icon">
                        <i class="fas fa-shield-halved"></i>
                    </div>
                    <div class="sidebar-logo-text">
                        <strong>Skyline Residency</strong>
                        <span>Society Manager</span>
                    </div>
                </div>

                <div class="sidebar-profile">
                    <div class="sidebar-avatar"><i class="fas fa-user-shield"></i></div>
                    <div class="sidebar-user">
                        <h4>${currentUser ? currentUser.full_name : 'Society Manager'}</h4>
                        <span>Admin Operations</span>
                    </div>
                </div>

                <nav class="sidebar-nav">
                    <div class="sidebar-section-label">MAIN OPERATIONS</div>
                    <a href="/dashboard.html" class="sidebar-link ${isDashboard ? 'active' : ''}">
                        <i class="fas fa-chart-pie"></i> <span>Dashboard</span>
                    </a>
                    <a href="/admin-complaints.html" class="sidebar-link ${isComplaints ? 'active' : ''}">
                        <i class="fas fa-list-check"></i> <span>Manage Complaints</span>
                    </a>
                    <a href="/admin-announcements.html" class="sidebar-link ${isAnnouncements ? 'active' : ''}">
                        <i class="fas fa-bullhorn"></i> <span>Broadcast Notices</span>
                    </a>
                    <a href="/admin-users.html" class="sidebar-link ${isUsers ? 'active' : ''}">
                        <i class="fas fa-users-gear"></i> <span>Resident Directory</span>
                    </a>
                    <a href="/admin-reports.html" class="sidebar-link ${isReports ? 'active' : ''}">
                        <i class="fas fa-chart-line"></i> <span>Analytics & Reports</span>
                    </a>

                    <div class="sidebar-section-label">SYSTEM</div>
                    <a href="/admin-export-pdf.html" target="_blank" class="sidebar-link">
                        <i class="fas fa-file-pdf"></i> <span>Print PDF Audit</span>
                    </a>
                    <a href="/index.html" class="sidebar-link">
                        <i class="fas fa-globe"></i> <span>View Public Site</span>
                    </a>
                </nav>

                <div class="sidebar-footer">
                    <button id="sidebarLogoutBtn" class="sidebar-logout">
                        <i class="fas fa-right-from-bracket"></i> <span>Logout Account</span>
                    </button>
                </div>
            </aside>
        `;

        const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
        if (sidebarLogoutBtn) {
            sidebarLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            });
        }
    }

    // 4. Render Footer if #app-footer container exists
    const footerContainer = document.getElementById('app-footer');
    if (footerContainer) {
        const isAdminPage = path.includes('dashboard') || path.includes('admin');
        if (isAdminPage) {
            footerContainer.innerHTML = '';
        } else {
            footerContainer.innerHTML = `
                <footer class="footer">
                    <div class="container">
                        <div class="footer-grid">
                            <div class="footer-brand-col">
                                <div class="footer-brand">
                                    <i class="fas fa-building-user"></i>
                                    <span>Skyline Residency</span>
                                </div>
                                <p class="footer-text">
                                    Premium Smart Apartment Portal for resident complaint management, maintenance dispatch, and community announcements.
                                </p>
                            </div>

                            <div class="footer-col">
                                <h4>Quick Links</h4>
                                <ul class="footer-links">
                                    <li><a href="/index.html"><i class="fas fa-angle-right"></i> Home Portal</a></li>
                                    <li><a href="/complaint.html"><i class="fas fa-angle-right"></i> Submit Ticket</a></li>
                                    <li><a href="/track.html"><i class="fas fa-angle-right"></i> Track Status</a></li>
                                    <li><a href="/announcements.html"><i class="fas fa-angle-right"></i> Notices</a></li>
                                    <li><a href="/contact.html"><i class="fas fa-angle-right"></i> Support</a></li>
                                </ul>
                            </div>

                            <div class="footer-col">
                                <h4>Management</h4>
                                <ul class="footer-links">
                                    <li><a href="/admin-login.html"><i class="fas fa-angle-right"></i> Admin Login</a></li>
                                    <li><a href="/dashboard.html"><i class="fas fa-angle-right"></i> Dashboard</a></li>
                                    <li><a href="/admin-complaints.html"><i class="fas fa-angle-right"></i> Dispatch Queue</a></li>
                                    <li><a href="/admin-reports.html"><i class="fas fa-angle-right"></i> Reports</a></li>
                                </ul>
                            </div>

                            <div class="footer-col">
                                <h4>Office Desk</h4>
                                <p style="margin-bottom: 0.5rem;"><i class="fas fa-location-dot"></i> Clubhouse L1, Skyline Ave</p>
                                <p style="margin-bottom: 0.5rem;"><i class="fas fa-phone"></i> +91 98765 43210</p>
                                <p><i class="fas fa-envelope"></i> helpdesk@skylineresidency.com</p>
                            </div>
                        </div>

                        <div class="footer-bottom">
                            <p>&copy; ${new Date().getFullYear()} Skyline Residency Association. All Rights Reserved.</p>
                            <div>
                                <a href="#" style="color: #94A3B8; margin-left: 1rem;">Privacy Policy</a>
                                <a href="#" style="color: #94A3B8; margin-left: 1rem;">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </footer>
            `;
        }
    }

    // 5. Global Logout Listener
    const globalLogoutBtn = document.getElementById('globalLogoutBtn');
    if (globalLogoutBtn) {
        globalLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
});

// Logout helper function
async function handleLogout() {
    try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            window.location.href = '/index.html';
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (err) {
        window.location.href = '/index.html';
    }
}
