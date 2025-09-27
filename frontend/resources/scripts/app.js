// University Lost & Found App with Authentication
class LostAndFoundApp {
    constructor() {
        this.currentUser = null;
        this.userType = null; // 'student' or 'admin'
        this.foundItems = [];
        this.missingReports = [];
        this.claims = [];
        this.students = [];
        this.currentFilter = '';
        this.currentSearch = '';
        this.apiBaseUrl = 'http://localhost:5141/api'; // API base URL
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthentication();
        this.loadDataFromAPI(); // Load data from API instead of localStorage
    }

    // Load data from API instead of localStorage
    async loadDataFromAPI() {
        try {
            await this.loadFoundItemsFromAPI();
            await this.loadClaimsFromAPI();
            this.renderFoundItems();
            if (this.userType === 'admin') {
                this.renderClaimsManagement();
                this.renderArchive();
            }
        } catch (error) {
            console.error('Error loading data from API:', error);
            this.showErrorMessage('Failed to load data from server');
        }
    }

    async loadFoundItemsFromAPI() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/founditems`);
            if (response.ok) {
                this.foundItems = await response.json();
            } else {
                console.error('Failed to load found items:', response.statusText);
                this.foundItems = [];
            }
        } catch (error) {
            console.error('Error loading found items:', error);
            this.foundItems = [];
        }
    }

    async loadClaimsFromAPI() {
        try {
            console.log('Loading claims from API...');
            const response = await fetch(`${this.apiBaseUrl}/claims`);
            console.log('Claims API response status:', response.status);
            
            if (response.ok) {
                this.claims = await response.json();
                console.log('Loaded claims from API:', this.claims);
                console.log('Claims count:', this.claims.length);
                
                // Log each claim's status for debugging
                this.claims.forEach((claim, index) => {
                    console.log(`Claim ${index}:`, {
                        id: claim.id,
                        status: claim.status,
                        statusType: typeof claim.status,
                        claimerName: claim.claimerName,
                        itemId: claim.itemId
                    });
                });
            } else {
                console.error('Failed to load claims:', response.statusText);
                this.claims = [];
            }
        } catch (error) {
            console.error('Error loading claims:', error);
            this.claims = [];
        }
    }

    showErrorMessage(message) {
        // Simple error message display
        alert(message);
    }

    clearAllData() {
        // Clear all data for fresh start
        this.foundItems = [];
        this.missingReports = [];
        this.claims = [];
        this.renderFoundItems();
        if (this.userType === 'admin') {
            this.renderClaimsManagement();
            this.renderArchive();
        }
    }

    // Debug method to check data integrity
    checkDataIntegrity() {
        console.log('=== DATA INTEGRITY CHECK ===');
        console.log('Found Items:', this.foundItems.length);
        console.log('Claims:', this.claims.length);
        console.log('Missing Reports:', this.missingReports.length);
        
        // Check for orphaned claims
        const orphanedClaims = this.claims.filter(claim => 
            !this.foundItems.find(item => item.id === claim.itemId)
        );
        if (orphanedClaims.length > 0) {
            console.warn('Orphaned claims found:', orphanedClaims);
        }
        
        // Check for duplicate claims
        const duplicateClaims = this.claims.filter((claim, index) => 
            this.claims.findIndex(c => c.id === claim.id) !== index
        );
        if (duplicateClaims.length > 0) {
            console.warn('Duplicate claims found:', duplicateClaims);
        }
        
        console.log('=== END CHECK ===');
    }

    // Debug method to manually refresh claims
    async refreshClaims() {
        console.log('=== MANUAL CLAIMS REFRESH ===');
        await this.loadClaimsFromAPI();
        if (this.userType === 'admin') {
            this.renderClaimsManagement();
            this.renderArchive();
        }
        console.log('=== REFRESH COMPLETE ===');
    }

    checkAuthentication() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentUser');
        const savedUserType = localStorage.getItem('userType');
        
        console.log('Checking authentication...');
        console.log('Saved user:', savedUser);
        console.log('Saved user type:', savedUserType);
        
        if (savedUser && savedUserType) {
            this.currentUser = JSON.parse(savedUser);
            this.userType = savedUserType;
            console.log('Loaded user from localStorage:', this.currentUser);
            this.showMainApp();
        } else {
            console.log('No saved user, showing landing page');
            this.showLandingPage();
        }
    }

    setupEventListeners() {
        // Landing page buttons
        document.getElementById('student-signin-btn').addEventListener('click', () => {
            this.showStudentLogin();
        });

        document.getElementById('admin-signin-btn').addEventListener('click', () => {
            this.showAdminLogin();
        });

        // Student login form
        document.getElementById('student-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStudentLogin(e.target);
        });

        // Student register form
        document.getElementById('student-register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStudentRegister(e.target);
        });

        // Admin login form
        document.getElementById('admin-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdminLogin(e.target);
        });

        // Navigation between login/register
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showStudentRegister();
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showStudentLogin();
        });

        // Main app navigation (only set up after authentication)
        this.setupMainAppListeners();
    }

    clearEventListeners() {
        // Remove all existing event listeners by cloning and replacing elements
        const foundItemsGrid = document.getElementById('found-items-grid');
        if (foundItemsGrid) {
            const newGrid = foundItemsGrid.cloneNode(true);
            foundItemsGrid.parentNode.replaceChild(newGrid, foundItemsGrid);
        }
    }

    setupMainAppListeners() {
        // Clear any existing listeners to prevent duplicates
        this.clearEventListeners();
        
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => await this.switchSection(e.target.dataset.section));
        });

        // Filters and search
        const buildingFilter = document.getElementById('building-filter');
        const searchInput = document.getElementById('search-items');
        
        if (buildingFilter) {
            buildingFilter.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderFoundItems();
        });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.renderFoundItems();
            });
        }

        // Item actions - using event delegation properly
        const foundItemsGrid = document.getElementById('found-items-grid');
        if (foundItemsGrid) {
            foundItemsGrid.addEventListener('click', (e) => {
                if (e.target.closest('.delete-btn')) {
                    const card = e.target.closest('.item-card');
                    const itemId = card.getAttribute('data-id');
                    this.deleteFoundItem(itemId);
                }
            });
        }

        // Claims management actions - using event delegation
        const claimsList = document.getElementById('claims-list');
        if (claimsList) {
            claimsList.addEventListener('click', (e) => {
                if (e.target.closest('.resolve-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const card = e.target.closest('.claim-card');
                    const claimId = card.getAttribute('data-claim-id');
                    console.log('Resolve button clicked via event delegation, claimId:', claimId);
                    this.resolveClaim(claimId);
                } else if (e.target.closest('.email-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const card = e.target.closest('.claim-card');
                    const claimId = card.getAttribute('data-claim-id');
                    const claim = this.claims.find(c => c.id === claimId);
                    if (claim) {
                        const itemName = claim.item?.name || 'Unknown Item';
                        this.emailClaimant(claim.claimerEmail, itemName);
                    }
                }
            });
        }

        // Forms
        const missingForm = document.getElementById('missing-item-form');
        const addFoundForm = document.getElementById('add-found-form');
        const claimForm = document.getElementById('claim-form');
        const claimItemForm = document.getElementById('claim-item-form');
        const claimItemPageForm = document.getElementById('claim-item-page-form');

        if (missingForm) {
            missingForm.addEventListener('submit', (e) => {
            e.preventDefault();
                // Prevent multiple rapid submissions
                if (this.isSubmitting) return;
                this.isSubmitting = true;
            this.handleMissingItemSubmit(e.target);
                setTimeout(() => { this.isSubmitting = false; }, 2000);
        });
        }

        if (addFoundForm) {
            addFoundForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddFoundItem(e.target);
        });
        }

        if (claimForm) {
            claimForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleClaimSubmit(e.target);
        });
        }

        if (claimItemForm) {
            claimItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleItemClaimSubmit(e.target);
        });
        }

        if (claimItemPageForm) {
            claimItemPageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Prevent multiple rapid submissions
                if (this.isSubmitting) return;
                this.isSubmitting = true;
                this.handleItemClaimPageSubmit(e.target);
                setTimeout(() => { this.isSubmitting = false; }, 2000);
            });
        }

        // Modal events
        const addFoundModal = document.getElementById('add-found-modal');
        const claimModal = document.getElementById('claim-modal');

        if (addFoundModal) {
            addFoundModal.addEventListener('click', (e) => {
            if (e.target.id === 'add-found-modal') {
                this.closeModal();
            }
        });
        }

        if (claimModal) {
            claimModal.addEventListener('click', (e) => {
            if (e.target.id === 'claim-modal') {
                this.closeClaimModal();
            }
        });
        }
    }

    // Authentication Methods
    showLandingPage() {
        this.hideAllPages();
        document.getElementById('landing-page').style.display = 'block';
    }

    showStudentLogin() {
        this.hideAllPages();
        document.getElementById('student-login-page').style.display = 'block';
    }

    showStudentRegister() {
        this.hideAllPages();
        document.getElementById('student-register-page').style.display = 'block';
    }

    showAdminLogin() {
        this.hideAllPages();
        document.getElementById('admin-login-page').style.display = 'block';
    }

    showMainApp() {
        this.hideAllPages();
        document.getElementById('main-app').style.display = 'block';
        this.setupNavigationForUserType();
        this.renderFoundItems();
        this.setCurrentDate();
    }

    setupNavigationForUserType() {
        const nav = document.querySelector('.nav');
        
        if (this.userType === 'student') {
            // Students see: Found Items only
            nav.innerHTML = `
                <button class="nav-btn active" data-section="found">Found Items</button>
                <button class="logout-btn" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            `;
        } else if (this.userType === 'admin') {
            // Admins see: Found Items, Add Found Item, Claims Management
            // Archive tab commented out - functionality still exists
            nav.innerHTML = `
                <button class="nav-btn active" data-section="found">Found Items</button>
                <button class="nav-btn" data-section="missing">Add Found Item</button>
                <button class="nav-btn" data-section="claims-management">Claims</button>
                <!-- <button class="nav-btn" data-section="archive">Archive</button> -->
                <button class="logout-btn" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            `;
        }
        
        // Re-setup event listeners for the new navigation
        this.setupMainAppListeners();
    }

    hideAllPages() {
        const pages = ['landing-page', 'student-login-page', 'student-register-page', 'admin-login-page', 'main-app'];
        pages.forEach(pageId => {
            const page = document.getElementById(pageId);
            if (page) page.style.display = 'none';
        });
    }

    async handleStudentLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const response = await fetch(`${this.apiBaseUrl}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const userData = await response.json();
                this.currentUser = {
                    id: userData.id,
                    name: userData.name,
                    email: email
                };
                this.userType = 'student';
                this.saveCurrentUser();
                this.showMainApp();
                this.showSuccessMessage('Welcome back, ' + userData.name + '!');
            } else {
                let errorMessage = 'Invalid email or password';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Failed to parse error response:', e);
                    errorMessage = `Server error (${response.status}): ${response.statusText}`;
                }
                this.showErrorMessage(errorMessage);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showErrorMessage('Login failed. Please try again.');
        }
    }

    async handleStudentRegister(form) {
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Validation
        if (password !== confirmPassword) {
            this.showErrorMessage('Passwords do not match');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    password, 
                    confirmPassword 
                })
            });

            if (response.ok) {
                const userData = await response.json();
                this.currentUser = {
                    id: userData.id,
                    name: userData.name,
                    email: userData.email
                };
                this.userType = 'student';
                this.saveCurrentUser();
                this.showMainApp();
                this.showSuccessMessage('Account created successfully! Welcome, ' + name + '!');
            } else {
                const errorData = await response.json();
                this.showErrorMessage(errorData.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showErrorMessage('Registration failed. Please try again.');
        }
    }

    async handleAdminLogin(form) {
        const formData = new FormData(form);
        const password = formData.get('password');

        try {
            const response = await fetch(`${this.apiBaseUrl}/users/admin-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password })
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('Admin login response:', userData);
                this.currentUser = {
                    id: userData.id,
                    name: userData.name,
                    email: 'admin@ua.edu'
                };
                console.log('Admin user object:', this.currentUser);
                this.userType = 'admin';
                this.saveCurrentUser();
                this.showMainApp();
                this.showSuccessMessage('Welcome, Administrator!');
            } else {
                const errorData = await response.json();
                this.showErrorMessage(errorData.message || 'Invalid admin password');
            }
        } catch (error) {
            console.error('Admin login error:', error);
            this.showErrorMessage('Admin login failed. Please try again.');
        }
    }

    logout() {
        this.currentUser = null;
        this.userType = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userType');
        this.showLandingPage();
    }

    saveCurrentUser() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        localStorage.setItem('userType', this.userType);
    }

    // Main App Methods (existing functionality)
    async switchSection(sectionName) {
        // Update navigation (only if the section has a nav button)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const navButton = document.querySelector(`[data-section="${sectionName}"]`);
        if (navButton) {
            navButton.classList.add('active');
        }

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Handle different section names for different user types
        let sectionId = `${sectionName}-section`;
        if (sectionName === 'claims-management') {
            sectionId = 'claims-management-section';
        } else if (sectionName === 'archive') {
            sectionId = 'archive-section';
        } else if (sectionName === 'claim-item') {
            sectionId = 'claim-item-section';
        }
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log(`Switched to section: ${sectionName} (${sectionId})`);
            
            // If switching to archive, render it
            if (sectionName === 'archive') {
                console.log('Rendering archive section...');
                this.renderArchive();
            }
        } else {
            console.error(`Section not found: ${sectionId}`);
        }

        // Show/hide floating button based on user type
        const floatingBtn = document.getElementById('add-found-btn');
        if (floatingBtn) {
            if (sectionName === 'found' && this.userType === 'admin') {
            floatingBtn.style.display = 'block';
        } else {
            floatingBtn.style.display = 'none';
            }
        }

        // Set current date for claim form when switching to claim section
        if (sectionName === 'claim') {
            this.setCurrentDate();
        }

        // Load claims management when switching to that section
        if (sectionName === 'claims-management') {
            console.log('Switching to claims management section...');
            // Reload claims from API to ensure we have the latest data
            await this.loadClaimsFromAPI();
            this.renderClaimsManagement();
        }

        // Load archive when switching to that section
        if (sectionName === 'archive') {
            this.renderArchive();
        }
    }

    renderFoundItems() {
        const grid = document.getElementById('found-items-grid');
        const noItems = document.getElementById('no-items');
        
        if (!grid || !noItems) return;
        
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
    
    async deleteFoundItem(itemId) {
        if (!itemId) {
            console.error('No item ID provided for deletion');
            return;
        }

        if (confirm('Are you sure you want to delete this item? This will also delete all associated claims.')) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/founditems/${itemId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // Remove the item from local array
                    this.foundItems = this.foundItems.filter(item => item.id !== itemId);
                    
                    // Remove all claims associated with this item from local array
                    this.claims = this.claims.filter(claim => claim.itemId !== itemId);
                    
                    // Re-render both views
                    this.renderFoundItems();
                    if (this.userType === 'admin') {
                        this.renderClaimsManagement();
                        this.renderArchive();
                    }
                    
                    this.showSuccessMessage('Item and all associated claims deleted successfully.');
                } else {
                    this.showErrorMessage('Failed to delete item');
                }
            } catch (error) {
                console.error('Delete item error:', error);
                this.showErrorMessage('Failed to delete item. Please try again.');
            }
        }
    }

    async handleMissingItemSubmit(form) {
        const formData = new FormData(form);
        const item = {
            name: formData.get('itemName'),
            description: formData.get('itemDescription'),
            building: formData.get('building'),
            room: formData.get('room'),
            dateFound: formData.get('dateFound') || new Date().toISOString().split('T')[0],
            addedBy: this.currentUser.id
        };

        console.log('Adding item via missing form:', item);
        console.log('Current user:', this.currentUser);

        try {
            const response = await fetch(`${this.apiBaseUrl}/founditems`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item)
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const newItem = await response.json();
                console.log('New item created:', newItem);
                this.foundItems.push(newItem);
                this.showSuccessMessage('Found item added successfully!');
                form.reset();
                this.renderFoundItems();
            } else {
                let errorMessage = 'Failed to add item';
                try {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Failed to parse error response:', e);
                    errorMessage = `Server error (${response.status}): ${response.statusText}`;
                }
                this.showErrorMessage(errorMessage);
            }
        } catch (error) {
            console.error('Add item error:', error);
            this.showErrorMessage('Failed to add item. Please try again.');
        }
    }

    async handleAddFoundItem(form) {
        const formData = new FormData(form);
        const item = {
            name: formData.get('itemName'),
            description: formData.get('itemDescription'),
            building: formData.get('building'),
            room: formData.get('room'),
            dateFound: formData.get('dateFound') || new Date().toISOString().split('T')[0],
            addedBy: this.currentUser.id
        };

        console.log('Adding item:', item);
        console.log('Current user:', this.currentUser);
        console.log('User ID:', this.currentUser?.id);
        console.log('User type:', this.userType);
        console.log('Form data fields:', {
            itemName: formData.get('itemName'),
            itemDescription: formData.get('itemDescription'),
            building: formData.get('building'),
            room: formData.get('room'),
            dateFound: formData.get('dateFound')
        });

        try {
            const response = await fetch(`${this.apiBaseUrl}/founditems`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item)
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const newItem = await response.json();
                console.log('New item created:', newItem);
                this.foundItems.push(newItem);
        this.showSuccessMessage('Found item added successfully!');
        form.reset();
        this.closeModal();
        this.renderFoundItems();
            } else {
                let errorMessage = 'Failed to add item';
                try {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Failed to parse error response:', e);
                    errorMessage = `Server error (${response.status}): ${response.statusText}`;
                }
                this.showErrorMessage(errorMessage);
            }
        } catch (error) {
            console.error('Add item error:', error);
            this.showErrorMessage('Failed to add item. Please try again.');
        }
    }

    handleClaimSubmit(form) {
        const formData = new FormData(form);
        const claim = {
            id: Date.now().toString(),
            itemName: formData.get('claimItem'),
            building: formData.get('claimBuilding'),
            room: formData.get('claimRoom'),
            claimerName: formData.get('claimerName'),
            claimerEmail: formData.get('claimerEmail'),
            claimDate: formData.get('claimDate') || new Date().toISOString().split('T')[0],
            dateSubmitted: new Date().toISOString(),
            claimedBy: this.currentUser.id
        };

        this.claims.push(claim);
        this.saveClaims();
        
        this.showSuccessMessage('Claim submitted successfully! We will review your claim and contact you if we find a matching item.');
        form.reset();
        this.setCurrentDate();
    }

    openClaimModal(itemId) {
        const item = this.foundItems.find(item => item.id === itemId);
        if (!item) return;

        // Populate the modal with item details
        document.getElementById('claim-item-id').value = item.id;
        document.getElementById('claim-item-name').value = item.name;
        document.getElementById('claim-item-building').value = item.building;
        document.getElementById('claim-item-room').value = item.room || '';
        document.getElementById('claim-claim-date').value = new Date().toISOString().split('T')[0];

        // Pre-fill with current user info if available
        if (this.currentUser && this.userType === 'student') {
            document.getElementById('claim-claimer-name').value = this.currentUser.name;
            document.getElementById('claim-claimer-email').value = this.currentUser.email;
        }

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

    handleItemClaimSubmit(form) {
        const formData = new FormData(form);
        const itemId = formData.get('itemId');
        const item = this.foundItems.find(item => item.id === itemId);
        
        if (!item) {
            this.showErrorMessage('Item not found!');
            return;
        }

        const claim = {
            id: Date.now().toString(),
            itemId: itemId,
            itemName: item.name,
            itemDescription: item.description,
            building: item.building,
            room: item.room,
            claimerName: formData.get('claimerName'),
            claimerEmail: formData.get('claimerEmail'),
            ownershipDetails: formData.get('ownershipDetails'),
            lostLocation: formData.get('lostLocation'),
            additionalInfo: formData.get('additionalInfo'),
            claimDate: formData.get('claimDate') || new Date().toISOString().split('T')[0],
            dateSubmitted: new Date().toISOString(),
            claimedBy: this.currentUser.id,
            status: 'pending'
        };

        this.claims.push(claim);
        this.saveClaims();
        
        this.showSuccessMessage(`Claim submitted successfully for "${item.name}"! We will contact you to verify ownership.`);
        form.reset();
        this.closeClaimModal();
    }

    showSuccessMessage(message) {
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        const container = document.querySelector('.container');
        if (container) {
        container.insertBefore(successDiv, container.firstChild);
        }

        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    showErrorMessage(message) {
        const existingMessage = document.querySelector('.error-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

        const container = document.querySelector('.auth-container') || document.querySelector('.container');
        if (container) {
            container.insertBefore(errorDiv, container.firstChild);
        }

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = ['date-lost', 'found-date', 'claim-date'];
        dateInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = today;
        });
    }

    // Local Storage Methods
    loadFoundItems() {
        const stored = localStorage.getItem('universityFoundItems');
        return stored ? JSON.parse(stored) : [];
    }

    loadMissingReports() {
        const stored = localStorage.getItem('universityMissingReports');
        return stored ? JSON.parse(stored) : [];
    }

    loadClaims() {
        const stored = localStorage.getItem('universityClaims');
        return stored ? JSON.parse(stored) : [];
    }

    loadStudents() {
        const stored = localStorage.getItem('universityStudents');
        return stored ? JSON.parse(stored) : [];
    }

    saveFoundItems() {
        localStorage.setItem('universityFoundItems', JSON.stringify(this.foundItems));
    }

    saveMissingReports() {
        localStorage.setItem('universityMissingReports', JSON.stringify(this.missingReports));
    }

    saveClaims() {
        localStorage.setItem('universityClaims', JSON.stringify(this.claims));
    }

    saveStudents() {
        localStorage.setItem('universityStudents', JSON.stringify(this.students));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
                    ${this.userType === 'student' ? `
                    <button class="claim-btn" title="Claim Item" onclick="goToClaimPage('${item.id}')">
                        <i class="fas fa-ticket-alt"></i> Claim
                    </button>
                    ` : ''}
                    ${this.userType === 'admin' ? `
                    <button class="delete-btn" title="Delete Item">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    ` : ''}
                </div>
            </div>          
        `;
    }

    renderClaimsManagement() {
        const claimsList = document.getElementById('claims-list');
        const noClaims = document.getElementById('no-claims');
        
        if (!claimsList || !noClaims) return;
        
        console.log('All claims:', this.claims);
        console.log('Claims count:', this.claims.length);
        
        // Filter for pending claims - check both string and enum values
        const pendingClaims = this.claims.filter(claim => {
            // Check for pending status in various formats
            return claim.status === 'pending' || 
                   claim.status === 'Pending' || 
                   claim.status === 0 || // ClaimStatus.Pending = 0
                   claim.status === '0' ||
                   (typeof claim.status === 'string' && claim.status.toLowerCase() === 'pending');
        });
        
        console.log('Pending claims:', pendingClaims);
        console.log('Pending claims count:', pendingClaims.length);
        
        if (pendingClaims.length === 0) {
            claimsList.style.display = 'none';
            noClaims.style.display = 'block';
            return;
        }

        claimsList.style.display = 'block';
        noClaims.style.display = 'none';

        claimsList.innerHTML = pendingClaims.map(claim => this.createClaimCard(claim)).join('');
    }

    createClaimCard(claim) {
        const date = new Date(claim.dateSubmitted).toLocaleDateString();
        const roomText = claim.lastSeenRoom ? `, Room ${claim.lastSeenRoom}` : '';
        
        // Get item details from the related item or use fallback values
        const itemName = claim.item?.name || 'Unknown Item';
        const itemDescription = claim.item?.description || 'No description available';
        const itemBuilding = claim.item?.building || 'Unknown Building';
        const itemRoom = claim.item?.room || '';
        const itemRoomText = itemRoom ? `, Room ${itemRoom}` : '';
        
        return `
            <div class="claim-card" data-claim-id="${claim.id}">
                <div class="claim-header">
                    <div class="claim-item-info">
                        <h4>${this.escapeHtml(itemName)}</h4>
                        <p><strong>Location:</strong> ${this.escapeHtml(itemBuilding)}${itemRoomText}</p>
                        <p><strong>Description:</strong> ${this.escapeHtml(itemDescription)}</p>
                    </div>
                    <span class="claim-date">${date}</span>
                </div>
                
                <div class="claim-details">
                    <h5><i class="fas fa-user-check"></i> Ownership Details</h5>
                    <p>${this.escapeHtml(claim.ownershipDetails)}</p>
                    
                    <h5><i class="fas fa-map-marker-alt"></i> Last Seen Location</h5>
                    <p><strong>Building:</strong> ${this.escapeHtml(claim.lastSeenBuilding)}</p>
                    ${claim.lastSeenRoom ? `<p><strong>Room:</strong> ${this.escapeHtml(claim.lastSeenRoom)}</p>` : ''}
                </div>
                
                <div class="claim-claimer-info">
                    <h5>Claimant Information</h5>
                    <p><strong>Name:</strong> ${this.escapeHtml(claim.claimerName)}</p>
                    <p><strong>Email:</strong> ${this.escapeHtml(claim.claimerEmail)}</p>
                    <p><strong>Claim Date:</strong> ${new Date(claim.claimDate).toLocaleDateString()}</p>
                    <p><strong>Submitted:</strong> ${new Date(claim.dateSubmitted).toLocaleString()}</p>
                </div>
                
                <div class="claim-actions">
                    <button class="email-btn">
                        <i class="fas fa-envelope"></i> Email
                    </button>
                    <button class="resolve-btn">
                        <i class="fas fa-check-circle"></i> Resolve Claim
                    </button>
                </div>
            </div>
        `;
    }

    emailClaimant(email, itemName) {
        const subject = `Claim for ${itemName} - Alabama Lost & Found`;
        const body = `Dear Student,\n\nThank you for your claim regarding the ${itemName}.\n\nPlease provide additional information or schedule a time to verify ownership.\n\nBest regards,\nAlabama Lost & Found Team`;
        
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
    }

    approveClaim(claimId) {
        if (confirm('Are you sure you want to approve this claim?')) {
            const claim = this.claims.find(c => c.id === claimId);
            if (claim) {
                claim.status = 'approved';
                this.saveClaims();
                this.renderClaimsManagement();
                this.showSuccessMessage('Claim approved successfully!');
            }
        }
    }

    rejectClaim(claimId) {
        if (confirm('Are you sure you want to reject this claim?')) {
            const claim = this.claims.find(c => c.id === claimId);
            if (claim) {
                claim.status = 'rejected';
                this.saveClaims();
                this.renderClaimsManagement();
                this.showSuccessMessage('Claim rejected.');
            }
        }
    }

    async resolveClaim(claimId) {
        if (!claimId) {
            console.error('No claim ID provided for resolution');
            return;
        }

        const claim = this.claims.find(c => c.id === claimId);
        if (!claim) {
            console.error('Claim not found:', claimId);
            this.showErrorMessage('Claim not found.');
            return;
        }

        const itemName = claim.item?.name || 'Unknown Item';
        if (confirm(`Are you sure you want to resolve this claim for "${itemName}"? This will move it to the archive.`)) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/claims/${claimId}/resolve`, {
                    method: 'PUT'
                });

                if (response.ok) {
                    // Remove claim from local array (soft delete)
                    this.claims = this.claims.filter(c => c.id !== claimId);
                    
                    // Re-render views
                    this.renderClaimsManagement();
                    this.renderArchive();
                    
                    this.showSuccessMessage(`Claim for "${itemName}" resolved and moved to archive.`);
                } else {
                    this.showErrorMessage('Failed to resolve claim');
                }
            } catch (error) {
                console.error('Resolve claim error:', error);
                this.showErrorMessage('Failed to resolve claim. Please try again.');
            }
        }
    }


    goToClaimPage(itemId) {
        const item = this.foundItems.find(item => item.id === itemId);
        if (!item) return;

        // Populate the claim page with item details
        document.getElementById('claim-item-page-id').value = item.id;
        
        // Create item details display
        const roomText = item.room ? `, Room ${item.room}` : '';
        const date = new Date(item.dateFound).toLocaleDateString();
        document.getElementById('claim-item-details').innerHTML = `
            <div class="item-preview-card">
                <h4>${this.escapeHtml(item.name)}</h4>
                <p><strong>Description:</strong> ${this.escapeHtml(item.description)}</p>
                <p><strong>Location:</strong> ${this.escapeHtml(item.building)}${roomText}</p>
                <p><strong>Date Found:</strong> ${date}</p>
            </div>
        `;

        // Pre-fill with current user info if available
        if (this.currentUser && this.userType === 'student') {
            document.getElementById('claim-page-name').value = this.currentUser.name;
            document.getElementById('claim-page-email').value = this.currentUser.email;
        }

        // Set current date
        document.getElementById('claim-page-date').value = new Date().toISOString().split('T')[0];

        // Ensure the claim form event listener is attached
        const claimForm = document.getElementById('claim-item-page-form');
        if (claimForm && !claimForm.hasAttribute('data-listener-attached')) {
            claimForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.isSubmitting) return;
                this.isSubmitting = true;
                this.handleItemClaimPageSubmit(e.target);
                setTimeout(() => { this.isSubmitting = false; }, 2000);
            });
            claimForm.setAttribute('data-listener-attached', 'true');
        }

        // Switch to claim page
        this.switchSection('claim-item');
    }

    async handleItemClaimPageSubmit(form) {
        const formData = new FormData(form);
        const itemId = formData.get('itemId');
        const item = this.foundItems.find(item => item.id === itemId);
        
        if (!item) {
            this.showErrorMessage('Item not found!');
            return;
        }

        // Check for duplicate claims from the same user for the same item
        const existingClaim = this.claims.find(claim => 
            claim.itemId === itemId && 
            claim.claimedBy === this.currentUser.id && 
            claim.status === 'pending'
        );

        if (existingClaim) {
            this.showErrorMessage('You have already submitted a claim for this item. Please wait for admin review.');
            return;
        }

        // Show confirmation dialog
        const claimerName = formData.get('claimerName');
        const claimerEmail = formData.get('claimerEmail');
        const ownershipDetails = formData.get('ownershipDetails');
        
        const confirmMessage = `Are you sure you want to submit a claim for "${item.name}"?\n\n` +
            `Your Details:\n` +
            `Name: ${claimerName}\n` +
            `Email: ${claimerEmail}\n` +
            `Ownership Details: ${ownershipDetails}\n\n` +
            `Once submitted, an administrator will review your claim and contact you if approved.`;
        
        if (!confirm(confirmMessage)) {
            return; // User cancelled
        }

        const claim = {
            itemId: itemId,
            claimerName: claimerName,
            claimerEmail: claimerEmail,
            lastSeenBuilding: formData.get('lastSeenBuilding'),
            lastSeenRoom: formData.get('lastSeenRoom'),
            ownershipDetails: ownershipDetails,
            claimDate: formData.get('claimDate') || new Date().toISOString().split('T')[0],
            claimedBy: this.currentUser.id,
            status: 'pending'
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/claims`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(claim)
            });

            if (response.ok) {
                const newClaim = await response.json();
                this.claims.push(newClaim);
                this.showSuccessMessage(`Claim submitted successfully for "${item.name}"! We will contact you to verify ownership.`);
                form.reset();
                this.switchSection('found');
            } else {
                let errorMessage = 'Failed to submit claim';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Failed to parse error response:', e);
                    errorMessage = `Server error (${response.status}): ${response.statusText}`;
                }
                this.showErrorMessage(errorMessage);
            }
        } catch (error) {
            console.error('Claim submission error:', error);
            this.showErrorMessage('Failed to submit claim. Please try again.');
        }
    }

    renderArchive() {
        const archiveList = document.getElementById('archive-list');
        const noArchive = document.getElementById('no-archive');
        
        if (!archiveList || !noArchive) return;
        
        const archivedClaims = this.claims.filter(claim => 
            claim.status === 'approved' || claim.status === 'Approved' || claim.status === 1 ||
            claim.status === 'rejected' || claim.status === 'Rejected' || claim.status === 2 ||
            claim.status === 'resolved' || claim.status === 'Resolved' || claim.status === 1
        );
        
        if (archivedClaims.length === 0) {
            archiveList.style.display = 'none';
            noArchive.style.display = 'block';
            return;
        }

        archiveList.style.display = 'block';
        noArchive.style.display = 'none';

        archiveList.innerHTML = archivedClaims.map(claim => this.createArchiveCard(claim)).join('');
    }

    createArchiveCard(claim) {
        const date = new Date(claim.dateSubmitted).toLocaleDateString();
        const roomText = claim.lastSeenRoom ? `, Room ${claim.lastSeenRoom}` : '';
        
        // Get item details from the related item or use fallback values
        const itemName = claim.item?.name || 'Unknown Item';
        const itemBuilding = claim.item?.building || 'Unknown Building';
        const itemRoom = claim.item?.room || '';
        const itemRoomText = itemRoom ? `, Room ${itemRoom}` : '';
        
        let statusClass, statusIcon, statusText;
        if (claim.status === 'approved' || claim.status === 'Approved' || claim.status === 1) {
            statusClass = 'approved';
            statusIcon = 'fa-check-circle';
            statusText = 'APPROVED';
        } else if (claim.status === 'rejected' || claim.status === 'Rejected' || claim.status === 2) {
            statusClass = 'rejected';
            statusIcon = 'fa-times-circle';
            statusText = 'REJECTED';
        } else if (claim.status === 'resolved' || claim.status === 'Resolved' || claim.status === 1) {
            statusClass = 'resolved';
            statusIcon = 'fa-check-double';
            statusText = 'RESOLVED';
        }
        
        return `
            <div class="claim-card archive-card ${statusClass}" data-claim-id="${claim.id}">
                <div class="claim-header expandable-header" onclick="toggleArchiveCard('${claim.id}')">
                    <div class="claim-item-info">
                        <h4>${this.escapeHtml(itemName)}</h4>
                        <p><strong>Claimant:</strong> ${this.escapeHtml(claim.claimerName)}</p>
                        <p><strong>Location:</strong> ${this.escapeHtml(itemBuilding)}${itemRoomText}</p>
                    </div>
                    <div class="claim-status">
                        <span class="status-badge ${statusClass}">
                            <i class="fas ${statusIcon}"></i> ${statusText}
                        </span>
                        <span class="claim-date">${date}</span>
                        <i class="fas fa-chevron-down expand-icon" id="expand-icon-${claim.id}"></i>
                    </div>
                </div>
                
                <div class="claim-details expandable-content" id="expandable-${claim.id}" style="display: none;">
                    <div class="claim-details-section">
                        <h5><i class="fas fa-info-circle"></i> Item Details</h5>
                        <p><strong>Description:</strong> ${this.escapeHtml(claim.item?.description || 'No description available')}</p>
                    </div>
                    
                    <div class="claim-details-section">
                        <h5><i class="fas fa-user-check"></i> Ownership Details</h5>
                        <p>${this.escapeHtml(claim.ownershipDetails)}</p>
                    </div>
                    
                    <div class="claim-details-section">
                        <h5><i class="fas fa-map-marker-alt"></i> Last Seen Location</h5>
                        <p><strong>Building:</strong> ${this.escapeHtml(claim.lastSeenBuilding)}</p>
                        ${claim.lastSeenRoom ? `<p><strong>Room:</strong> ${this.escapeHtml(claim.lastSeenRoom)}</p>` : ''}
                    </div>
                    
                    <div class="claim-details-section">
                        <h5><i class="fas fa-user"></i> Claimant Information</h5>
                        <p><strong>Name:</strong> ${this.escapeHtml(claim.claimerName)}</p>
                        <p><strong>Email:</strong> ${this.escapeHtml(claim.claimerEmail)}</p>
                        <p><strong>Claim Date:</strong> ${new Date(claim.claimDate).toLocaleDateString()}</p>
                        <p><strong>Submitted:</strong> ${new Date(claim.dateSubmitted).toLocaleString()}</p>
                        ${claim.resolvedDate ? `<p><strong>Resolved:</strong> ${new Date(claim.resolvedDate).toLocaleString()}</p>` : ''}
                    </div>
                </div>
            </div>          
        `;
    }
}

// Modal Functions
function openModal() {
    console.log('openModal() called');
    document.getElementById('add-found-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Ensure the form event listener is attached
    const form = document.getElementById('add-found-form');
    console.log('Form found:', form);
    if (form && !form.hasAttribute('data-listener-attached')) {
        console.log('Adding event listener to form');
        form.addEventListener('submit', (e) => {
            console.log('Form submitted!');
            e.preventDefault();
            if (window.app) {
                console.log('Calling handleAddFoundItem');
                window.app.handleAddFoundItem(e.target);
            } else {
                console.error('window.app not found');
            }
        });
        form.setAttribute('data-listener-attached', 'true');
    } else {
        console.log('Form already has listener or form not found');
    }
}

function closeModal() {
    document.getElementById('add-found-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function closeClaimModal() {
    document.getElementById('claim-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showLandingPage() {
    if (window.app) {
        window.app.showLandingPage();
    }
}

function logout() {
    if (window.app) {
        window.app.logout();
    }
}

function checkDataIntegrity() {
    if (window.app) {
        window.app.checkDataIntegrity();
    }
}

function debugArchive() {
    if (window.app) {
        console.log('=== MANUAL ARCHIVE DEBUG ===');
        console.log('Current user type:', window.app.userType);
        console.log('All claims:', window.app.claims);
        console.log('Claims with resolved status:', window.app.claims.filter(c => c.status === 'resolved'));
        window.app.renderArchive();
    }
}

function testResolveClaim() {
    if (window.app && window.app.claims.length > 0) {
        const firstClaim = window.app.claims[0];
        console.log('Testing resolve claim for:', firstClaim);
        window.app.resolveClaim(firstClaim.id);
    } else {
        console.log('No claims found to test with');
    }
}

function createTestResolvedClaim() {
    if (window.app) {
        const testClaim = {
            id: 'test-resolved-' + Date.now(),
            itemId: 'test-item-1',
            itemName: 'Test iPhone',
            itemDescription: 'Black iPhone 12 Pro',
            building: 'Bruno',
            room: '201',
            claimerName: 'Test Student',
            claimerEmail: 'test@crimson.ua.edu',
            lastSeenBuilding: 'Bruno',
            lastSeenRoom: '201',
            ownershipDetails: 'This is my phone because it has a specific scratch on the back',
            claimDate: new Date().toISOString().split('T')[0],
            dateSubmitted: new Date().toISOString(),
            claimedBy: 'test-user',
            status: 'resolved',
            resolvedDate: new Date().toISOString(),
            resolvedBy: 'admin-user'
        };
        
        window.app.claims.push(testClaim);
        window.app.saveClaims();
        console.log('Created test resolved claim:', testClaim);
        window.app.renderArchive();
    }
}

function toggleArchiveCard(claimId) {
    const expandableContent = document.getElementById(`expandable-${claimId}`);
    const expandIcon = document.getElementById(`expand-icon-${claimId}`);
    
    if (expandableContent && expandIcon) {
        if (expandableContent.style.display === 'none') {
            expandableContent.style.display = 'block';
            expandIcon.classList.remove('fa-chevron-down');
            expandIcon.classList.add('fa-chevron-up');
        } else {
            expandableContent.style.display = 'none';
            expandIcon.classList.remove('fa-chevron-up');
            expandIcon.classList.add('fa-chevron-down');
        }
    }
}

function emailClaimant(email, itemName) {
    if (window.app) {
        window.app.emailClaimant(email, itemName);
    }
}

function approveClaim(claimId) {
    if (window.app) {
        window.app.approveClaim(claimId);
    }
}

function rejectClaim(claimId) {
    if (window.app) {
        window.app.rejectClaim(claimId);
    }
}

function goToClaimPage(itemId) {
    if (window.app) {
        window.app.goToClaimPage(itemId);
    }
}

function goBackToFoundItems() {
    if (window.app) {
        window.app.switchSection('found');
    }
}

function resolveClaim(claimId) {
    console.log('Global resolveClaim called with ID:', claimId);
    if (window.app) {
        window.app.resolveClaim(claimId);
    } else {
        console.error('window.app not found!');
    }
}

function refreshClaims() {
    if (window.app) {
        window.app.refreshClaims();
    } else {
        console.error('window.app not found!');
    }
}


// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LostAndFoundApp();
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeClaimModal();
    }
});