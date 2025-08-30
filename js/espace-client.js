document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');

    if (loginForm && loginSection && dashboardSection) {
        // Show login form by default
        loginSection.classList.add('active');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent actual form submission
            loginSection.classList.remove('active');
            dashboardSection.classList.add('active');
        });
    }

    if (logoutButton && loginSection && dashboardSection) {
        logoutButton.addEventListener('click', () => {
            dashboardSection.classList.remove('active');
            loginSection.classList.add('active');
        });
    }
});
