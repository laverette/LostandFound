// University Lost & Found App
class LostAndFoundApp {
    constructor() {
        this.foundItems = this.loadFoundItems();
        this.missingReports = this.loadMissingReports();
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

        // Modal
        document.getElementById('add-found-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-found-modal') {
                this.closeModal();
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
    }

    // Local Storage Methods
    loadFoundItems() {
        const stored = localStorage.getItem('universityFoundItems');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Return sample data for demonstration
        return [
            {
                id: '1',
                name: 'Black iPhone 13',
                description: 'Black iPhone 13 with a clear case. Screen has a small crack in the top right corner.',
                building: 'Library',
                room: 'Study Room 205',
                dateFound: '2024-01-15'
            },
            {
                id: '2',
                name: 'Blue Backpack',
                description: 'Navy blue Jansport backpack with laptop compartment. Contains notebooks and pens.',
                building: 'Student Center',
                room: 'Cafeteria',
                dateFound: '2024-01-14'
            },
            {
                id: '3',
                name: 'Silver Watch',
                description: 'Silver analog watch with leather band. Brand appears to be Timex.',
                building: 'Science Building',
                room: 'Lab 301',
                dateFound: '2024-01-13'
            },
            {
                id: '4',
                name: 'Red Water Bottle',
                description: 'Red Hydro Flask water bottle with stickers on it. 32oz capacity.',
                building: 'Gymnasium',
                room: '',
                dateFound: '2024-01-12'
            },
            {
                id: '5',
                name: 'Textbook - Calculus',
                description: 'Calculus textbook by Stewart. 8th edition. Has highlighting and notes inside.',
                building: 'Arts Building',
                room: 'Room 102',
                dateFound: '2024-01-11'
            }
        ];
    }

    loadMissingReports() {
        const stored = localStorage.getItem('universityMissingReports');
        return stored ? JSON.parse(stored) : [];
    }

    saveFoundItems() {
        localStorage.setItem('universityFoundItems', JSON.stringify(this.foundItems));
    }

    saveMissingReports() {
        localStorage.setItem('universityMissingReports', JSON.stringify(this.missingReports));
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
                <button class="delete-btn" title="Delete Item">
                    <i class="fas fa-trash"></i> Delete
                </button>
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