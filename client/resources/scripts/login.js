class LoginApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Role selection buttons
        document.getElementById('student-login-btn').addEventListener('click', () => {
            this.showStudentLogin();
        });

        document.getElementById('admin-login-btn').addEventListener('click', () => {
            this.showAdminLogin();
        });

        // Back to role selection
        document.getElementById('back-to-role-selection').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRoleSelection();
        });

        document.getElementById('back-to-role-selection-admin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRoleSelection();
        });

        // Form submissions
        document.getElementById('student-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStudentLogin(e.target);
        });

        document.getElementById('admin-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdminLogin(e.target);
        });
    }

    showRoleSelection() {
        document.getElementById('role-selection').style.display = 'block';
        document.getElementById('student-login-container').style.display = 'none';
        document.getElementById('admin-login-container').style.display = 'none';
    }

    showStudentLogin() {
        document.getElementById('role-selection').style.display = 'none';
        document.getElementById('student-login-container').style.display = 'block';
        document.getElementById('admin-login-container').style.display = 'none';
    }

    showAdminLogin() {
        document.getElementById('role-selection').style.display = 'none';
        document.getElementById('student-login-container').style.display = 'none';
        document.getElementById('admin-login-container').style.display = 'block';
    }

    async handleStudentLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');

        if (!this.isCrimsonEmail(email)) {
            this.showMessage('Only @crimson.ua.edu email addresses are allowed.', 'error');
            return;
        }

        // Simulate student login
        const user = {
            name: this.extractNameFromEmail(email),
            email: email,
            role: 'student'
        };

        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        this.showMessage('Login successful! Redirecting...', 'success');
        
        // Redirect to main page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    async handleAdminLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        // Check admin credentials
        if (email !== 'lostf@crimson.ua.edu' || password !== 'GoBama') {
            this.showMessage('Invalid admin credentials.', 'error');
            return;
        }

        // Simulate admin login
        const user = {
            name: 'Lost & Found Admin',
            email: email,
            role: 'admin'
        };

        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        this.showMessage('Admin login successful! Redirecting...', 'success');
        
        // Redirect to main page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    isCrimsonEmail(email) {
        return email && email.toLowerCase().endsWith('@crimson.ua.edu');
    }

    extractNameFromEmail(email) {
        const localPart = email.split('@')[0];
        return localPart.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('auth-message');
        messageEl.textContent = message;
        messageEl.className = `alert alert-${type === 'error' ? 'danger' : 'success'}`;
        messageEl.style.display = 'block';

        // Hide message after 5 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginApp();
});
