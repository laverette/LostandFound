// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (localStorage.getItem('user')) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');
    const showLoginLink = document.getElementById('show-login');
    const showRegisterLink = document.getElementById('show-register');
    const authMessage = document.getElementById('auth-message');

    // Switch between login and register forms
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
        hideMessage();
    });

    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';
        hideMessage();
    });

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const role = document.getElementById('login-role').value;
        
        // Validate inputs
        if (!isValidCrimsonEmail(email)) {
            showMessage('Please enter a valid @crimson.ua.edu email address.', 'danger');
            return;
        }
        
        if (!role) {
            showMessage('Please select a role.', 'danger');
            return;
        }

        // Simulate login (in real app, this would call your API)
        const user = {
            email: email.toLowerCase(),
            name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            role: role,
            loginTime: new Date().toISOString()
        };

        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        showMessage('Login successful! Redirecting...', 'success');
        
        // Redirect to main app after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });

    // Handle register form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const role = document.getElementById('register-role').value;
        
        // Validate inputs
        if (!name.trim()) {
            showMessage('Please enter your full name.', 'danger');
            return;
        }
        
        if (!isValidCrimsonEmail(email)) {
            showMessage('Please enter a valid @crimson.ua.edu email address.', 'danger');
            return;
        }
        
        if (!role) {
            showMessage('Please select a role.', 'danger');
            return;
        }

        // Simulate registration (in real app, this would call your API)
        const user = {
            email: email.toLowerCase(),
            name: name,
            role: role,
            registerTime: new Date().toISOString()
        };

        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        showMessage('Registration successful! Redirecting...', 'success');
        
        // Redirect to main app after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });

    // Validate Crimson email format
    function isValidCrimsonEmail(email) {
        const crimsonEmailRegex = /^[a-zA-Z0-9._%+-]+@crimson\.ua\.edu$/;
        return crimsonEmailRegex.test(email);
    }

    // Show message to user
    function showMessage(text, type) {
        authMessage.textContent = text;
        authMessage.className = `alert alert-${type}`;
        authMessage.style.display = 'flex';
    }

    // Hide message
    function hideMessage() {
        authMessage.style.display = 'none';
    }
});
