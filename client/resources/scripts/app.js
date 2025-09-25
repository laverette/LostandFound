// University Lost & Found App
class LostAndFoundApp {
    constructor() {
        this.foundItems = this.loadFoundItems();
        this.missingReports = this.loadMissingReports();
        this.archivedReports = [];
        this.claims = this.loadClaims();
        this.currentFilter = '';
        this.currentSearch = '';
    this.urgentOnly = false;
        // API base: prefer localhost:4000 during development, otherwise relative paths
        this.apiBase = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
            ? `${location.protocol}//${location.hostname}:4000` : '';

        this.init();
    }

    async deleteFoundItem(itemId) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        // Try API first
        const apiOk = await this.deleteFoundFromApi(itemId);
        // Always remove locally for immediate feedback
        this.foundItems = this.foundItems.filter(item => item.id !== itemId);
        this.saveFoundItems();
        this.renderFoundItems();

        if (apiOk) {
            this.showSuccessMessage('Item deleted successfully.');
        } else {
            this.showSuccessMessage('Item removed locally (offline). It will be synced when the server is available.');
        }
    }

    init() {
        this.setupEventListeners();
        this.renderFoundItems();
        this.renderMissingReports();
        this.renderArchive && this.renderArchive();
        // Try to sync from API on startup
        this.syncFromApi();
        // Ask server to run auto-archive and then fetch archives
        (async () => {
            try {
                await fetch(this.apiBase + '/api/auto-archive', { method: 'POST' });
            } catch (e) {
                // ignore
            }
            const archives = await this.fetchArchivesFromApi();
            if (archives) { this.archivedReports = archives; this.renderArchive(); }
        })();
        this.setCurrentDate();
        // run auto-archive to move stale missing reports
        this.runAutoArchive && this.runAutoArchive();
        
    }

    // --- API helpers ---
    async syncFromApi() {
        try {
            const [found, missing, claims] = await Promise.all([
                this.fetchFoundFromApi(),
                this.fetchMissingFromApi(),
                this.fetchClaimsFromApi()
            ]);
            if (found) { this.foundItems = found; this.saveFoundItems(); this.renderFoundItems(); }
            if (missing) { this.missingReports = missing; this.saveMissingReports(); this.renderMissingReports(); }
            if (claims) { this.claims = claims; this.saveClaims(); }
            // fetch archives too
            const archives = await this.fetchArchivesFromApi();
            if (archives) { this.archivedReports = archives; this.renderArchive(); }
        } catch (err) {
            // silent fallback to localStorage
            console.warn('API sync failed:', err && err.message);
        }
    }

    async fetchFoundFromApi() {
        try {
            const res = await fetch(this.apiBase + '/api/found');
            if (!res.ok) throw new Error('Failed to fetch found items');
            return await res.json();
        } catch (err) {
            return null;
        }
    }

    async addFoundToApi(item) {
        try {
            const res = await fetch(this.apiBase + '/api/found', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            return res.ok;
        } catch (err) {
            return false;
        }
    }

    async deleteFoundFromApi(id) {
        try {
            const res = await fetch(this.apiBase + '/api/found/' + encodeURIComponent(id), { method: 'DELETE' });
            return res.ok;
        } catch (err) {
            return false;
        }
    }

    async fetchMissingFromApi() {
        try {
            const res = await fetch(this.apiBase + '/api/missing');
            if (!res.ok) throw new Error('Failed to fetch missing reports');
            return await res.json();
        } catch (err) {
            return null;
        }
    }

    async addMissingToApi(report) {
        try {
            const res = await fetch(this.apiBase + '/api/missing', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            });
            return res.ok;
        } catch (err) {
            return false;
        }
    }

    async fetchClaimsFromApi() {
        try {
            const res = await fetch(this.apiBase + '/api/claims');
            if (!res.ok) throw new Error('Failed to fetch claims');
            return await res.json();
        } catch (err) {
            return null;
        }
    }

    async fetchArchivesFromApi() {
        try {
            const res = await fetch(this.apiBase + '/api/archive');
            if (!res.ok) throw new Error('Failed to fetch archive');
            return await res.json();
        } catch (err) {
            return null;
        }
    }

    async addClaimToApi(claim) {
        try {
            const res = await fetch(this.apiBase + '/api/claims', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(claim)
            });
            return res.ok;
        } catch (err) {
            return false;
        }
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

        // Urgent filter
        const urgentFilterEl = document.getElementById('urgent-filter');
        if (urgentFilterEl) {
            urgentFilterEl.addEventListener('change', (e) => {
                this.urgentOnly = e.target.checked;
                this.renderFoundItems();
            });
        }

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
            const matchesUrgent = !this.urgentOnly || !!item.urgent;
            const matchesSearch = !this.currentSearch || 
                item.name.toLowerCase().includes(this.currentSearch) ||
                item.description.toLowerCase().includes(this.currentSearch) ||
                item.building.toLowerCase().includes(this.currentSearch) ||
                (item.room && item.room.toLowerCase().includes(this.currentSearch));
            
            return matchesFilter && matchesUrgent && matchesSearch;
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
        // Read urgent checkbox explicitly so it's a boolean
        const urgentChecked = !!(formData.get('urgent') === 'on' || document.getElementById('urgent')?.checked === true);
        const report = {
            id: Date.now().toString(),
            itemName: formData.get('itemName'),
            itemDescription: formData.get('itemDescription'),
            lastSeenBuilding: formData.get('lastSeenBuilding'),
            lastSeenRoom: formData.get('lastSeenRoom'),
            studentName: formData.get('studentName'),
            studentEmail: formData.get('studentEmail'),
            claimQuestion: formData.get('claimQuestion') || null,
            claimAnswer: formData.get('claimAnswer') || null,
            dateLost: formData.get('dateLost'),
            dateReported: new Date().toISOString(),
            urgent: urgentChecked
        };

        this.missingReports.push(report);
        this.saveMissingReports();

        // Add the missing report as a found item so it appears on the homepage
        const foundItem = {
            id: report.id,
            name: report.itemName,
            description: report.itemDescription,
            building: report.lastSeenBuilding,
            room: report.lastSeenRoom,
            dateFound: report.dateLost || new Date().toISOString().split('T')[0],
            urgent: report.urgent === true,
            claimQuestion: report.claimQuestion || null,
            claimAnswer: report.claimAnswer || null
        };
        this.foundItems.push(foundItem);
        this.saveFoundItems();
        this.renderFoundItems();

        // Try to send to API (non-blocking)
        (async () => {
            const missingOk = await this.addMissingToApi(report);
            const foundOk = await this.addFoundToApi(foundItem);
            if (missingOk || foundOk) {
                this.showSuccessMessage('Missing item report submitted and synced with server!');
            } else {
                this.showSuccessMessage('Missing item report submitted and added to found items!');
            }
        })();
        form.reset();
        this.renderMissingReports();
    }
    renderMissingReports() {
        const grid = document.getElementById('missing-reports-grid');
        const noReports = document.getElementById('no-missing-reports');
        if (!grid || !noReports) return;

        if (this.missingReports.length === 0) {
            grid.style.display = 'none';
            noReports.style.display = 'block';
            return;
        }
        grid.style.display = 'grid';
        noReports.style.display = 'none';
        grid.innerHTML = this.missingReports.map(report => this.createMissingReportCard(report)).join('');
    }

    // Archive is backend-managed; archivedReports is populated from API

    renderArchive() {
        const grid = document.getElementById('archive-grid');
        const noArchive = document.getElementById('no-archive');
        if (!grid || !noArchive) return;
        if (!this.archivedReports || this.archivedReports.length === 0) {
            grid.style.display = 'none';
            noArchive.style.display = 'block';
            return;
        }
        grid.style.display = 'grid';
        noArchive.style.display = 'none';
        grid.innerHTML = this.archivedReports.map(r => this.createArchiveCard(r)).join('');
    }

    createArchiveCard(report) {
        const date = report.dateReported ? new Date(report.dateReported).toLocaleDateString() : '';
        const roomText = report.lastSeenRoom ? `, Room ${report.lastSeenRoom}` : '';
        const urgentIcon = report.urgent ? '<span class="urgent-icon" title="Urgent"><i class="fas fa-exclamation-circle" style="color:#e02424;"></i></span>' : '';
        return `
            <div class="item-card" data-id="${report.id}">
                <div class="item-header">
                    <h3 class="item-name">${urgentIcon} ${this.escapeHtml(report.itemName)}</h3>
                    <span class="item-date">${date}</span>
                </div>
                <p class="item-description">${this.escapeHtml(report.itemDescription)}</p>
                <div class="item-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${this.escapeHtml(report.lastSeenBuilding)}${roomText}</span>
                </div>
                <div class="item-meta">
                    <span><strong>Reported by:</strong> ${this.escapeHtml(report.studentName)} (${this.escapeHtml(report.studentEmail)})</span>
                    <div style="margin-top:0.5rem; color:#718096; font-size:0.85rem;">Archived at: ${new Date(report.archivedAt).toLocaleString()}</div>
                </div>
            </div>
        `;
    }

    // Auto-archive missing reports older than 7 days and not claimed
    runAutoArchive() {
        // Trigger server-side auto-archive so archives are authoritative
        (async () => {
            try {
                const res = await fetch(this.apiBase + '/api/auto-archive', { method: 'POST' });
                if (res.ok) {
                    const listRes = await this.fetchArchivesFromApi();
                    if (listRes) { this.archivedReports = listRes; }
                    // refresh missing reports from server too
                    const missing = await this.fetchMissingFromApi();
                    if (missing) { this.missingReports = missing; this.saveMissingReports(); }
                }
            } catch (e) {
                // keep client-side behavior if server unavailable
                console.warn('Auto-archive request failed, skipping server-side archival.');
            }
            this.renderMissingReports();
            this.renderArchive();
        })();
    }
    

    createMissingReportCard(report) {
        const date = report.dateLost ? new Date(report.dateLost).toLocaleDateString() : '';
        const roomText = report.lastSeenRoom ? `, Room ${report.lastSeenRoom}` : '';
        const urgentIcon = report.urgent ? '<span class="urgent-icon" title="Urgent"><i class="fas fa-exclamation-circle" style="color:#e02424;"></i></span>' : '';
        return `
            <div class="item-card" data-id="${report.id}">
                <div class="item-header">
                    <h3 class="item-name">${urgentIcon} ${this.escapeHtml(report.itemName)}</h3>
                    <span class="item-date">${date}</span>
                </div>
                <p class="item-description">${this.escapeHtml(report.itemDescription)}</p>
                <div class="item-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${this.escapeHtml(report.lastSeenBuilding)}${roomText}</span>
                </div>
                <div class="item-meta">
                    <span><strong>Reported by:</strong> <strong>${this.escapeHtml(report.studentName)}</strong> (${this.escapeHtml(report.studentEmail)})</span>
                    
                </div>
            </div>
        `;
    }

    async handleAddFoundItem(form) {
        const formData = new FormData(form);
        const item = {
            id: Date.now().toString(),
            name: formData.get('itemName'),
            description: formData.get('itemDescription'),
            building: formData.get('building'),
            room: formData.get('room'),
            dateFound: formData.get('dateFound') || new Date().toISOString().split('T')[0],
            claimQuestion: formData.get('claimQuestion') || null,
            claimAnswer: formData.get('claimAnswer') || null
        };

        // Optimistic local save
        this.foundItems.push(item);
        this.saveFoundItems();
        this.renderFoundItems();

        // Try to send to API
        const ok = await this.addFoundToApi(item);
        if (ok) {
            this.showSuccessMessage('Found item added successfully!');
        } else {
            this.showSuccessMessage('Added locally (offline). Will sync when API is available.');
        }

        form.reset();
        this.closeModal();
    }

    async handleClaimSubmit(form) {
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

        const ok = await this.addClaimToApi(claim);
        if (ok) {
            this.showSuccessMessage('Claim submitted successfully! We will review your claim and contact you if we find a matching item.');
        } else {
            this.showSuccessMessage('Claim submitted locally (offline). It will sync when the server is available.');
        }

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

    // show claim question if present; if not present on the found item, fall back to a matching missing report's question
    const missingReport = this.missingReports.find(r => r.id === item.id);
    const challenge = item.claimQuestion || (missingReport ? missingReport.claimQuestion : '') || '';
    document.getElementById('claim-question').textContent = challenge ? challenge : 'No claim question set for this item.';
    // clear the claimant's answer input
    const claimAnswerEl = document.getElementById('claim-answer');
    if (claimAnswerEl) claimAnswerEl.value = '';

        // Show the modal
        document.getElementById('claim-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeClaimModal() {
        document.getElementById('claim-modal').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    async handleItemClaimSubmit(form) {
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
            claimAnswer: formData.get('claimAnswer') || null,
            dateSubmitted: new Date().toISOString()
        };

        this.claims.push(claim);
        this.saveClaims();

        const ok = await this.addClaimToApi(claim);
        if (ok) {
            this.showSuccessMessage(`Claim submitted successfully for "${item.name}"! We will contact you to verify ownership.`);
        } else {
            this.showSuccessMessage(`Claim queued locally for "${item.name}" (offline).`);
        }

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
        const urgentIcon = item.urgent ? '<span class="urgent-icon" title="Urgent"><i class="fas fa-exclamation-circle" style="color:#e02424;"></i></span>' : '';
        // try to find reporter info from missingReports (if this item originated from a missing report)
        const missing = this.missingReports.find(r => r.id === item.id);
        const reporterNameAttr = missing ? ` data-reporter-name="${this.escapeHtml(missing.studentName || '')}"` : '';
        const reporterEmailAttr = missing ? ` data-reporter-email="${this.escapeHtml(missing.studentEmail || '')}"` : '';

        return `
            <div class="item-card" data-id="${item.id}">
                <div class="item-header">
                    <h3 class="item-name">${urgentIcon} ${this.escapeHtml(item.name)}</h3>
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
    window.lostAndFoundAppInstance = new LostAndFoundApp();
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
 