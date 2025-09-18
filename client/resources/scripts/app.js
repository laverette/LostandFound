// University Lost & Found App
class LostAndFoundApp {
    constructor() {
        this.foundItems = this.loadFoundItems();
        this.missingReports = this.loadMissingReports();
        this.claims = this.loadClaims();
        this.currentFilter = '';
        this.currentSearch = '';
        
        this.init();
    }

    deleteFoundItem(itemId) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.foundItems = this.foundItems.filter(item => item.id !== itemId);
            this.saveFoundItems();
            this.renderFoundItems();
            this.showSuccessMessage('Item deleted successfully.');
        }
    }

    init() {
        this.setupEventListeners();
        this.renderFoundItems();
        this.setCurrentDate();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        // Filters and search
        document.getElementById('building-filter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderFoundItems();
        });

    
        document.getElementById('found-items-grid').addEventListener('click', (e) => {
                if (e.target.closest('.delete-btn')) {
                    const card = e.target.closest('.item-card');
                    const itemId = card.getAttribute('data-id');
                    this.deleteFoundItem(itemId);
                } else if (e.target.closest('.claim-btn')) {
                    const card = e.target.closest('.item-card');
                    const itemId = card.getAttribute('data-id');
                    this.openClaimModal(itemId);
                }
            });

        document.getElementById('search-items').addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.renderFoundItems();
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

        // Modal
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
    }

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
    

    handleMissingItemSubmit(form) {
        const formData = new FormData(form);
        const report = {
            id: Date.now().toString(),
            itemName: formData.get('itemName'),
            itemDescription: formData.get('itemDescription'),
            lastSeenBuilding: formData.get('lastSeenBuilding'),
            lastSeenRoom: formData.get('lastSeenRoom'),
            studentName: formData.get('studentName'),
            studentEmail: formData.get('studentEmail'),
            dateLost: formData.get('dateLost'),
            dateReported: new Date().toISOString()
        };

        this.missingReports.push(report);
        this.saveMissingReports();
        
        this.showSuccessMessage('Missing item report submitted successfully! We will contact you if your item is found.');
        form.reset();
    }

    handleAddFoundItem(form) {
        const formData = new FormData(form);
        const item = {
            id: Date.now().toString(),
            name: formData.get('itemName'),
            description: formData.get('itemDescription'),
            building: formData.get('building'),
            room: formData.get('room'),
            dateFound: formData.get('dateFound') || new Date().toISOString().split('T')[0]
        };

        this.foundItems.push(item);
        this.saveFoundItems();
        
        this.showSuccessMessage('Found item added successfully!');
        form.reset();
        this.closeModal();
        this.renderFoundItems();
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
            dateSubmitted: new Date().toISOString()
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
            this.showSuccessMessage('Item not found!', 'error');
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
            claimDate: formData.get('claimDate') || new Date().toISOString().split('T')[0],
            dateSubmitted: new Date().toISOString()
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
        container.insertBefore(successDiv, container.firstChild);

        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date-lost').value = today;
        document.getElementById('found-date').value = today;
        document.getElementById('claim-date').value = today;
    }

    // Local Storage Methods
    loadFoundItems() {
        const stored = localStorage.getItem('universityFoundItems');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Return empty array for clean start
        return [];
    }

    loadMissingReports() {
        const stored = localStorage.getItem('universityMissingReports');
        return stored ? JSON.parse(stored) : [];
    }

    loadClaims() {
        const stored = localStorage.getItem('universityClaims');
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
                    <button class="claim-btn" title="Claim Item" data-item-id="${item.id}">
                        <i class="fas fa-ticket-alt"></i> Claim
                    </button>
                    <button class="delete-btn" title="Delete Item">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>          
        `;
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LostAndFoundApp();
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});