// University Lost & Found App with API Integration
class LostAndFoundApp {
    constructor() {
        this.apiBaseUrl = 'https://localhost:7000/api'; // Update this to match your API URL
        this.currentUser = null;
        this.foundItems = [];
        this.currentFilter = '';
        this.currentSearch = '';
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadFoundItems();
        this.setCurrentDate();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        // Authentication
        document.getElementById('login-btn').addEventListener('click', () => this.openLoginModal());
        document.getElementById('register-btn').addEventListener('click', () => this.openRegisterModal());
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());

        // Auth forms
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e.target);
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister(e.target);
        });

        // Filters and search
        document.getElementById('building-filter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderFoundItems();
        });

        document.getElementById('search-items').addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.renderFoundItems();
        });

        // Item actions
        document.getElementById('found-items-grid').addEventListener('click', (e) => {
            if (e.target.closest('.claim-btn')) {
                const card = e.target.closest('.item-card');
                const itemId = card.getAttribute('data-id');
                this.openClaimModal(itemId);
            }
        });

        // Forms
        document.getElementById('missing-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMissingItemSubmit(e.target);
        });

        document.getElementById('add-found-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddFoundItem(e.target);
        });

        document.getElementById('claim-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleClaimSubmit(e.target);
        });

        document.getElementById('claim-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleItemClaimSubmit(e.target);
        });

        // Modal close events
        document.getElementById('add-found-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-found-modal') {
                this.closeModal();
            }
        });

        document.getElementById('claim-modal').addEventListener('click', (e) => {
            if (e.target.id === 'claim-modal') {
                this.closeClaimModal();
            }
        });

        document.getElementById('login-modal').addEventListener('click', (e) => {
            if (e.target.id === 'login-modal') {
                this.closeLoginModal();
            }
        });

        document.getElementById('register-modal').addEventListener('click', (e) => {
            if (e.target.id === 'register-modal') {
                this.closeRegisterModal();
            }
        });
    }

    // Authentication Methods
    async handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');

        if (!this.isCrimsonEmail(email)) {
            this.showMessage('Only @crimson.ua.edu email addresses are allowed.', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.ok) {
                this.currentUser = result.user;
                this.updateAuthUI();
                this.closeLoginModal();
                this.showMessage('Login successful!', 'success');
            } else {
                this.showMessage(result.message || 'Login failed.', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async handleRegister(form) {
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');

        if (!this.isCrimsonEmail(email)) {
            this.showMessage('Only @crimson.ua.edu email addresses are allowed.', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email })
            });

            const result = await response.json();

            if (response.ok) {
                this.currentUser = result.user;
                this.updateAuthUI();
                this.closeRegisterModal();
                this.showMessage('Registration successful!', 'success');
            } else {
                this.showMessage(result.message || 'Registration failed.', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    logout() {
        this.currentUser = null;
        this.updateAuthUI();
        this.showMessage('Logged out successfully.', 'success');
    }

    isCrimsonEmail(email) {
        return email && email.toLowerCase().endsWith('@crimson.ua.edu');
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const userInfo = document.getElementById('user-info');
        const userName = document.getElementById('user-name');

        if (this.currentUser) {
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            userInfo.style.display = 'flex';
            userName.textContent = this.currentUser.name;
        } else {
            loginBtn.style.display = 'block';
            registerBtn.style.display = 'block';
            userInfo.style.display = 'none';
        }
    }

    checkAuthStatus() {
        // Check if user is already logged in (you could implement session storage here)
        this.updateAuthUI();
    }

    // Modal Methods
    openLoginModal() {
        document.getElementById('login-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLoginModal() {
        document.getElementById('login-modal').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    openRegisterModal() {
        document.getElementById('register-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeRegisterModal() {
        document.getElementById('register-modal').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // API Methods
    async loadFoundItems() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/item`);
            if (response.ok) {
                this.foundItems = await response.json();
                this.renderFoundItems();
            } else {
                console.error('Failed to load items');
                this.foundItems = [];
            }
        } catch (error) {
            console.error('Error loading items:', error);
            this.foundItems = [];
        }
    }

    async handleAddFoundItem(form) {
        if (!this.currentUser) {
            this.showMessage('Please login to add found items.', 'error');
            return;
        }

        const formData = new FormData(form);
        const itemData = {
            name: formData.get('itemName'),
            description: formData.get('itemDescription'),
            building: formData.get('building'),
            room: formData.get('room'),
            dateFound: formData.get('dateFound') || new Date().toISOString().split('T')[0],
            finderName: this.currentUser.name,
            finderEmail: this.currentUser.email
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/item/found`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(itemData)
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Found item added successfully!', 'success');
                form.reset();
                this.closeModal();
                await this.loadFoundItems();
            } else {
                this.showMessage(result.message || 'Failed to add item.', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async handleMissingItemSubmit(form) {
        if (!this.currentUser) {
            this.showMessage('Please login to report missing items.', 'error');
            return;
        }

        const formData = new FormData(form);
        const missingItemData = {
            name: formData.get('itemName'),
            description: formData.get('itemDescription'),
            building: formData.get('lastSeenBuilding'),
            room: formData.get('lastSeenRoom'),
            dateLost: formData.get('dateLost'),
            reporterName: this.currentUser.name,
            reporterEmail: this.currentUser.email
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/item/missing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(missingItemData)
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Missing item report submitted successfully!', 'success');
                form.reset();
            } else {
                this.showMessage(result.message || 'Failed to submit report.', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async handleClaimSubmit(form) {
        if (!this.currentUser) {
            this.showMessage('Please login to submit claims.', 'error');
            return;
        }

        const formData = new FormData(form);
        const claimData = {
            itemName: formData.get('claimItem'),
            building: formData.get('claimBuilding'),
            room: formData.get('claimRoom'),
            claimerName: this.currentUser.name,
            claimerEmail: this.currentUser.email,
            claimDate: formData.get('claimDate') || new Date().toISOString().split('T')[0]
        };

        this.showMessage('Claim submitted successfully! We will review your claim and contact you if we find a matching item.', 'success');
        form.reset();
        this.setCurrentDate();
    }

    async handleItemClaimSubmit(form) {
        if (!this.currentUser) {
            this.showMessage('Please login to claim items.', 'error');
            return;
        }

        const formData = new FormData(form);
        const itemId = formData.get('itemId');
        const item = this.foundItems.find(item => item.id == itemId);
        
        if (!item) {
            this.showMessage('Item not found!', 'error');
            return;
        }

        const claimData = {
            itemId: itemId,
            itemName: item.name,
            itemDescription: item.description,
            building: item.building,
            room: item.room,
            claimerName: this.currentUser.name,
            claimerEmail: this.currentUser.email,
            claimDate: formData.get('claimDate') || new Date().toISOString().split('T')[0]
        };

        this.showMessage(`Claim submitted successfully for "${item.name}"! We will contact you to verify ownership.`, 'success');
        form.reset();
        this.closeClaimModal();
    }

    // UI Methods
    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        // Show/hide floating button
        const floatingBtn = document.getElementById('add-found-btn');
        if (sectionName === 'found') {
            floatingBtn.style.display = 'block';
        } else {
            floatingBtn.style.display = 'none';
        }

        // Set current date for claim form when switching to claim section
        if (sectionName === 'claim') {
            this.setCurrentDate();
        }
    }

    renderFoundItems() {
        const grid = document.getElementById('found-items-grid');
        const noItems = document.getElementById('no-items');
        
        let filteredItems = this.foundItems.filter(item => {
            const matchesFilter = !this.currentFilter || item.building === this.currentFilter;
            const matchesSearch = !this.currentSearch || 
                item.name.toLowerCase().includes(this.currentSearch) ||
                item.description.toLowerCase().includes(this.currentSearch) ||
                item.building.toLowerCase().includes(this.currentSearch) ||
                (item.room && item.room.toLowerCase().includes(this.currentSearch));
            
            return matchesFilter && matchesSearch;
        });

        if (filteredItems.length === 0) {
            grid.style.display = 'none';
            noItems.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        noItems.style.display = 'none';

        grid.innerHTML = filteredItems.map(item => this.createItemCard(item)).join('');
    }

    createItemCard(item) {
        const date = new Date(item.dateFound).toLocaleDateString();
        const roomText = item.room ? `, Room ${item.room}` : '';
        
        return `
            <div class="item-card" data-id="${item.id}">
                <div class="item-header">
                    <h3 class="item-name">${this.escapeHtml(item.name)}</h3>
                    <span class="item-date">${date}</span>
                </div>
                <p class="item-description">${this.escapeHtml(item.description)}</p>
                <div class="item-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${this.escapeHtml(item.building)}${roomText}</span>
                </div>
                <div class="item-actions">
                    <button class="claim-btn" title="Claim Item" data-item-id="${item.id}">
                        <i class="fas fa-ticket-alt"></i> Claim
                    </button>
                </div>
            </div>          
        `;
    }

    openClaimModal(itemId) {
        const item = this.foundItems.find(item => item.id == itemId);
        if (!item) return;

        // Populate the modal with item details
        document.getElementById('claim-item-id').value = item.id;
        document.getElementById('claim-item-name').value = item.name;
        document.getElementById('claim-item-building').value = item.building;
        document.getElementById('claim-item-room').value = item.room || '';
        document.getElementById('claim-claim-date').value = new Date().toISOString().split('T')[0];

        // Create item preview
        const roomText = item.room ? `, Room ${item.room}` : '';
        const date = new Date(item.dateFound).toLocaleDateString();
        document.getElementById('claim-item-preview').innerHTML = `
            <div class="item-preview-card">
                <h4>${this.escapeHtml(item.name)}</h4>
                <p><strong>Description:</strong> ${this.escapeHtml(item.description)}</p>
                <p><strong>Location:</strong> ${this.escapeHtml(item.building)}${roomText}</p>
                <p><strong>Date Found:</strong> ${date}</p>
            </div>
        `;

        // Show the modal
        document.getElementById('claim-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeClaimModal() {
        document.getElementById('claim-modal').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    showMessage(message, type = 'success') {
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `success-message ${type === 'error' ? 'error-message' : ''}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        `;

        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date-lost').value = today;
        document.getElementById('found-date').value = today;
        document.getElementById('claim-date').value = today;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Modal Functions
function openModal() {
    document.getElementById('add-found-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('add-found-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function closeClaimModal() {
    document.getElementById('claim-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function closeRegisterModal() {
    document.getElementById('register-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LostAndFoundApp();
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeClaimModal();
        closeLoginModal();
        closeRegisterModal();
    }
});