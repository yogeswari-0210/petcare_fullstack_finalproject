function updateNavbar() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    // Remove existing dynamic links to avoid duplication
    const existingAdminLink = document.getElementById('admin-pane-link');
    if (existingAdminLink) existingAdminLink.remove();

    // 1. If Admin, show Admin Panel link
    if (role === 'admin' && token) {
        const adminLink = document.createElement('a');
        adminLink.id = 'admin-pane-link';
        // Adjust path based on current location
        const isInPagesFolder = window.location.pathname.includes('/pages/');
        adminLink.href = isInPagesFolder ? './admin_dashboard.html' : './pages/admin_dashboard.html';
        adminLink.innerHTML = '<i class="bi bi-shield-lock"></i> Admin Panel';
        adminLink.style.color = '#ff9d00';
        adminLink.style.fontWeight = 'bold';

        // Insert before the first link or at the beginning
        navLinks.insertBefore(adminLink, navLinks.firstChild);
    }

    // 2. Handle Login/Logout button toggle
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn && token) {
        loginBtn.innerHTML = `<i class="bi bi-box-arrow-right"></i> Logout (${username || 'User'})`;
        loginBtn.classList.add('logout-active');
        loginBtn.href = '#';
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            alert('Logged out successfully');
            window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : './index.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', updateNavbar);
