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
        const data = await res.json();
        if (data.authenticated && data.user) {
            currentUser = data.user;
        }
    } catch (e) {
        console.warn('Auth check skipped or failed:', e);
    }

    // Identify active path
    const path = window.location.pathname;

    // 2. Render Header Navbar if #app-navbar container exists
    const navbarContainer = document.getElementById('app-navbar');
    if (navbarContainer) {
        const isHome = path === '/' || path.endsWith('/index.html');
        const isNewComplaint = path.includes('/complaint.html') || path.includes('/complaints/new');
        const isTrack = path.includes('/track.html') || path.includes('/track');
        const isAnnouncements = path.includes('/announcements.html') || path === '/announcements';
        const isContact = path.includes('/contact.html') || path === '/contact';
        const isAdminPage = path.includes('dashboard') || path.includes('admin') || path.includes('/admin-');

        navbarContainer.innerHTML = `
            <nav class="navbar">
                <div class="navbar-container">
                    <a href="/index.html" class="navbar-brand">
                        <i class="fas fa-building-user brand-icon"></i>
                        <div class="brand-text">
                            <span class="brand-title">Skyline Residency</span>
                            <span class="brand-subtitle">Smart Apartment Management</span>
                        </div>
                    </a>

                    <button class="navbar-toggler" id="navbarToggler" aria-label="Toggle navigation">
                        <i class="fas fa-bars"></i>
                    </button>

                    <div class="navbar-menu" id="navbarMenu">
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a href="/index.html" class="nav-link ${isHome ? 'active' : ''}">
                                    <i class="fas fa-home"></i> Home
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="/complaint.html" class="nav-link ${isNewComplaint ? 'active' : ''}">
                                    <i class="fas fa-paper-plane"></i> Submit Complaint
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="/track.html" class="nav-link ${isTrack ? 'active' : ''}">
                                    <i class="fas fa-magnifying-glass"></i> Track Status
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="/announcements.html" class="nav-link ${isAnnouncements ? 'active' : ''}">
                                    <i class="fas fa-bullhorn"></i> Notices
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="/contact.html" class="nav-link ${isContact ? 'active' : ''}">
                                    <i class="fas fa-headset"></i> Contact
                                </a>
                            </li>
                        </ul>

                        <div class="navbar-actions">
                            ${currentUser ? `
                                <div class="user-profile-badge">
                                    <i class="fas fa-user-shield"></i>
                                    <span>${currentUser.full_name || 'Admin'}</span>
                                </div>
                                <a href="/dashboard.html" class="btn btn-sm btn-primary ${isAdminPage ? 'active' : ''}">
                                    <i class="fas fa-chart-line"></i> Admin Portal
                                </a>
                                <button id="globalLogoutBtn" class="btn btn-sm btn-outline-danger">
                                    <i class="fas fa-right-from-bracket"></i> Logout
                                </button>
                            ` : `
                                <a href="/admin-login.html" class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-lock"></i> Admin Login
                                </a>
                            `}
                        </div>
                    </div>
                </div>
            </nav>
        `;

        // Mobile navbar toggler
        const toggler = document.getElementById('navbarToggler');
        const menu = document.getElementById('navbarMenu');
        if (toggler && menu) {
            toggler.addEventListener('click', () => {
                menu.classList.toggle('show');
            });
        }
    }

    // 3. Render Admin Sidebar if #app-admin-sidebar container exists
    const adminSidebarContainer = document.getElementById('app-admin-sidebar');
    if (adminSidebarContainer) {
        const isDashboard = path.endsWith('/dashboard.html') || path.endsWith('/admin') || path.endsWith('/admin/dashboard');
        const isComplaints = path.includes('/admin-complaints.html') || path.includes('/admin-complaint-detail.html');
        const isAnnouncements = path.includes('/admin-announcements.html');
        const isUsers = path.includes('/admin-users.html');
        const isReports = path.includes('/admin-reports.html');

        adminSidebarContainer.innerHTML = `
            <aside class="admin-sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-badge">
                        <i class="fas fa-shield-halved"></i>
                        <div>
                            <h4>Society Manager</h4>
                            <p>Admin Operations</p>
                        </div>
                    </div>
                </div>
                <ul class="sidebar-menu">
                    <li>
                        <a href="/dashboard.html" class="${isDashboard ? 'active' : ''}">
                            <i class="fas fa-chart-pie"></i> <span>Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="/admin-complaints.html" class="${isComplaints ? 'active' : ''}">
                            <i class="fas fa-list-check"></i> <span>Manage Complaints</span>
                        </a>
                    </li>
                    <li>
                        <a href="/admin-announcements.html" class="${isAnnouncements ? 'active' : ''}">
                            <i class="fas fa-bullhorn"></i> <span>Broadcast Notices</span>
                        </a>
                    </li>
                    <li>
                        <a href="/admin-users.html" class="${isUsers ? 'active' : ''}">
                            <i class="fas fa-users-gear"></i> <span>Resident Directory</span>
                        </a>
                    </li>
                    <li>
                        <a href="/admin-reports.html" class="${isReports ? 'active' : ''}">
                            <i class="fas fa-chart-line"></i> <span>Analytics & Reports</span>
                        </a>
                    </li>
                    <li class="menu-divider">SYSTEM</li>
                    <li>
                        <a href="/admin-export-pdf.html" target="_blank">
                            <i class="fas fa-file-pdf"></i> <span>Print PDF Audit</span>
                        </a>
                    </li>
                    <li>
                        <a href="/index.html">
                            <i class="fas fa-globe"></i> <span>View Public Site</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" id="sidebarLogoutBtn" class="text-danger">
                            <i class="fas fa-right-from-bracket"></i> <span>Logout</span>
                        </a>
                    </li>
                </ul>
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
        footerContainer.innerHTML = `
            <footer class="footer">
                <div class="footer-container">
                    <div class="footer-grid">
                        <div class="footer-brand-col">
                            <div class="footer-logo">
                                <i class="fas fa-building-user"></i>
                                <span>Skyline Residency</span>
                            </div>
                            <p class="footer-desc">
                                Premium Smart Apartment Portal for resident complaint management, maintenance dispatch, and community announcements.
                            </p>
                            <div class="footer-socials">
                                <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                                <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                                <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                                <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>

                        <div class="footer-links-col">
                            <h4>Quick Navigation</h4>
                            <ul>
                                <li><a href="/index.html"><i class="fas fa-chevron-right"></i> Home Portal</a></li>
                                <li><a href="/complaint.html"><i class="fas fa-chevron-right"></i> Submit Maintenance Ticket</a></li>
                                <li><a href="/track.html"><i class="fas fa-chevron-right"></i> Track Complaint Status</a></li>
                                <li><a href="/announcements.html"><i class="fas fa-chevron-right"></i> Society Notice Board</a></li>
                                <li><a href="/contact.html"><i class="fas fa-chevron-right"></i> Resident Support</a></li>
                            </ul>
                        </div>

                        <div class="footer-links-col">
                            <h4>Society Management</h4>
                            <ul>
                                <li><a href="/admin-login.html"><i class="fas fa-chevron-right"></i> Admin Login</a></li>
                                <li><a href="/dashboard.html"><i class="fas fa-chevron-right"></i> Manager Dashboard</a></li>
                                <li><a href="/admin-complaints.html"><i class="fas fa-chevron-right"></i> Ticket Dispatch Queue</a></li>
                                <li><a href="/admin-reports.html"><i class="fas fa-chevron-right"></i> Resolution Performance</a></li>
                            </ul>
                        </div>

                        <div class="footer-contact-col">
                            <h4>Management Office</h4>
                            <p><i class="fas fa-location-dot"></i> Clubhouse Level 1, Skyline Residency, Main Avenue</p>
                            <p><i class="fas fa-phone"></i> +91 98765 43210 (24x7 Control Desk)</p>
                            <p><i class="fas fa-envelope"></i> helpdesk@skylineresidency.com</p>
                            <p><i class="fas fa-clock"></i> Office Hours: 8:00 AM – 8:00 PM</p>
                        </div>
                    </div>

                    <div class="footer-bottom">
                        <p>&copy; ${new Date().getFullYear()} Skyline Residency Society Association. All Rights Reserved.</p>
                        <div class="footer-bottom-links">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Bylaws & Rules</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }

    // 5. Setup logout event listener for global logout button
    const globalLogoutBtn = document.getElementById('globalLogoutBtn');
    if (globalLogoutBtn) {
        globalLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
});

// Logout helper
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
