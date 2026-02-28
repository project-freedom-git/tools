// Domain Vault Application
class DomainVault {
    constructor() {
        this.currentUser = null;
        this.domains = [];
        this.providers = [];
        this.notifications = [];
        this.translations = {
            en: {
                brandName: 'DOMAIN VAULT',
                brandSlogan: 'Secure Domain Portfolio Manager',
                dashboard: 'Dashboard',
                allDomains: 'All Domains',
                domainProviders: 'Domain Providers',
                toolsResources: 'Tools & Resources',
                calendar: 'Calendar',
                notifications: 'Notifications',
                settings: 'Settings',
                searchPlaceholder: 'Search domains...',
                addNewDomain: 'Add New Domain',
                addNewProvider: 'Add New Provider',
                totalDomains: 'Total Domains',
                annualCost: 'Annual Cost',
                totalInvestment: 'Total Investment',
                expiringSoon: 'Expiring Soon',
                urgentRenewals: 'Top 5 Urgent Renewals',
                domainName: 'Domain Name',
                renewalDate: 'Renewal Date',
                daysLeft: 'Days Left',
                price: 'Price',
                provider: 'Provider',
                status: 'Status',
                actions: 'Actions',
                active: 'Active',
                expiring: 'Expiring',
                expired: 'Expired',
                save: 'Save',
                cancel: 'Cancel',
                delete: 'Delete',
                edit: 'Edit',
                view: 'View',
                credentials: 'Credentials',
                dnsRecords: 'DNS Records',
                checkDns: 'Check DNS',
                syncToGoogle: 'Sync to Google',
                downloadIcs: 'Download ICS',
                footer: 'Powered by Project Freedom ✊'
            },
            es: {
                brandName: 'DOMINIO VAULT',
                brandSlogan: 'Administrador Seguro de Dominios',
                dashboard: 'Panel',
                allDomains: 'Todos los Dominios',
                domainProviders: 'Proveedores',
                toolsResources: 'Herramientas',
                calendar: 'Calendario',
                notifications: 'Notificaciones',
                settings: 'Ajustes',
                searchPlaceholder: 'Buscar dominios...',
                addNewDomain: 'Añadir Dominio',
                addNewProvider: 'Añadir Proveedor',
                totalDomains: 'Total Dominios',
                annualCost: 'Costo Anual',
                totalInvestment: 'Inversión Total',
                expiringSoon: 'Próximos a Vencer',
                urgentRenewals: 'Renovaciones Urgentes',
                domainName: 'Dominio',
                renewalDate: 'Fecha Renovación',
                daysLeft: 'Días Restantes',
                price: 'Precio',
                provider: 'Proveedor',
                status: 'Estado',
                actions: 'Acciones',
                active: 'Activo',
                expiring: 'Por Vencer',
                expired: 'Vencido',
                save: 'Guardar',
                cancel: 'Cancelar',
                delete: 'Eliminar',
                edit: 'Editar',
                view: 'Ver',
                credentials: 'Credenciales',
                dnsRecords: 'Registros DNS',
                checkDns: 'Verificar DNS',
                syncToGoogle: 'Sincronizar con Google',
                downloadIcs: 'Descargar ICS',
                footer: 'Desarrollado por Project Freedom ✊'
            }
        };
        this.currentLang = 'en';
        this.init();
    }

    async init() {
        try {
            await this.loadInitialData();
            this.setupEventListeners();
            this.initializeUI();
            this.checkAuth();
            this.setupMobileNavigation();
            this.setupFlipCards();
            this.renderSampleData();
            console.log('Domain Vault initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showToast('Error initializing application', 'error');
        }
    }

    async loadInitialData() {
        // Load providers from localStorage or use defaults
        const savedProviders = localStorage.getItem('providers');
        if (savedProviders) {
            this.providers = JSON.parse(savedProviders);
        } else {
            this.providers = [
                { id: '1', name: 'Namecheap', url: 'https://www.namecheap.com', domains: 12 },
                { id: '2', name: 'GoDaddy', url: 'https://www.godaddy.com', domains: 8 },
                { id: '3', name: 'Google Domains', url: 'https://domains.google', domains: 4 }
            ];
        }

        // Load domains from localStorage or use defaults
        const savedDomains = localStorage.getItem('domains');
        if (savedDomains) {
            this.domains = JSON.parse(savedDomains);
        } else {
            this.domains = this.generateSampleDomains();
        }
    }

    generateSampleDomains() {
        const providers = ['Namecheap', 'GoDaddy', 'Google Domains'];
        const domains = [];
        const today = new Date();

        for (let i = 1; i <= 12; i++) {
            const renewalDate = new Date(today);
            renewalDate.setMonth(today.getMonth() + Math.floor(Math.random() * 12) + 1);
            
            domains.push({
                id: i.toString(),
                name: `example${i}.com`,
                provider: providers[Math.floor(Math.random() * providers.length)],
                renewalDate: renewalDate.toISOString().split('T')[0],
                price: (Math.random() * 20 + 8).toFixed(2),
                status: Math.random() > 0.7 ? 'expiring' : 'active',
                autoRenew: Math.random() > 0.5
            });
        }
        return domains;
    }

    setupEventListeners() {
        // Menu navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Add domain buttons
        document.querySelectorAll('#addDomainBtn, #addDomainBtnSecondary').forEach(btn => {
            btn.addEventListener('click', () => this.openDomainModal());
        });

        // Add provider button
        document.getElementById('addProviderBtn')?.addEventListener('click', () => this.openProviderModal());

        // Search input
        document.getElementById('searchInput')?.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Translate button
        document.getElementById('translateBtn')?.addEventListener('click', () => this.toggleLanguage());

        // Notification icon
        document.getElementById('headerNotificationIcon')?.addEventListener('click', () => {
            document.querySelector('[data-page="notifications"]').click();
        });

        // User avatar click
        document.getElementById('userAvatar')?.addEventListener('click', () => {
            document.querySelector('[data-page="settings"]').click();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Domain form submit
        document.getElementById('domainForm')?.addEventListener('submit', (e) => this.handleDomainSubmit(e));

        // Provider form submit
        document.getElementById('providerForm')?.addEventListener('submit', (e) => this.handleProviderSubmit(e));

        // Password toggle
        document.querySelectorAll('.toggle-password').forEach(icon => {
            icon.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });

        // Fetch WHOIS
        document.getElementById('fetchWhoisBtn')?.addEventListener('click', () => this.fetchWhois());

        // Calendar navigation
        document.getElementById('prevMonthBtn')?.addEventListener('click', () => this.navigateCalendar(-1));
        document.getElementById('nextMonthBtn')?.addEventListener('click', () => this.navigateCalendar(1));

        // Sync calendar buttons
        document.getElementById('syncGCalBtn')?.addEventListener('click', () => this.syncWithGoogleCalendar());
        document.getElementById('downloadIcsBtn')?.addEventListener('click', () => this.downloadIcs());

        // Quick DNS check
        document.getElementById('quickDnsBtn')?.addEventListener('click', () => this.quickDnsCheck());

        // Filter tags for tools
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.filterTools(e));
        });

        // Settings profile form
        document.getElementById('settingsProfileForm')?.addEventListener('submit', (e) => this.handleProfileSubmit(e));

        // Color palette
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => this.changeAccentColor(e));
        });

        // Custom color picker
        document.getElementById('customColorPicker')?.addEventListener('change', (e) => {
            this.setAccentColor(e.target.value);
        });

        // Upload profile picture
        document.getElementById('uploadPicBtn')?.addEventListener('click', () => {
            document.getElementById('profilePicUpload').click();
        });

        document.getElementById('profilePicUpload')?.addEventListener('change', (e) => this.handleProfilePictureUpload(e));

        // Remove profile picture
        document.getElementById('removePicBtn')?.addEventListener('click', () => this.removeProfilePicture());

        // Theme toggle (if you add a theme toggle button)
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
    }

    handleNavigation(e) {
        const menuItem = e.currentTarget;
        const pageId = menuItem.dataset.page;
        
        // Update active menu
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        menuItem.classList.add('active');
        
        // Show selected page
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(`page-${pageId}`)?.classList.add('page active');
        
        // Close mobile sidebar if open
        if (window.innerWidth <= 991) {
            document.querySelector('.sidebar')?.classList.remove('active');
            document.querySelector('.nav-overlay')?.classList.remove('active');
        }
        
        // Load page-specific data
        this.loadPageData(pageId);
    }

    loadPageData(pageId) {
        switch(pageId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'domains':
                this.renderDomains();
                break;
            case 'providers':
                this.renderProviders();
                break;
            case 'tools':
                this.renderTools();
                break;
            case 'calendar':
                this.initCalendar();
                break;
            case 'notifications':
                this.renderNotifications();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    updateDashboard() {
        // Update stats
        const totalDomains = this.domains.length;
        const uniqueProviders = new Set(this.domains.map(d => d.provider)).size;
        const expiringSoon = this.domains.filter(d => this.getDaysUntilRenewal(d.renewalDate) <= 30).length;
        const yearlyTotal = this.domains.reduce((sum, d) => sum + parseFloat(d.price), 0);
        const totalInvestment = yearlyTotal * 2; // Example calculation

        document.getElementById('stat-total-domains').textContent = totalDomains;
        document.getElementById('stat-domain-providers').textContent = uniqueProviders;
        document.getElementById('stat-yearly-expenses').textContent = `$${yearlyTotal.toFixed(2)}`;
        document.getElementById('stat-total-investment').textContent = `$${totalInvestment.toFixed(2)}`;
        document.getElementById('stat-expiring-soon').textContent = expiringSoon;

        // Update urgent renewals
        this.renderUrgentRenewals();
        
        // Update charts
        this.renderExpensesChart();
        this.renderProvidersChart();
    }

    renderUrgentRenewals() {
        const tbody = document.getElementById('urgentRenewalsBody');
        if (!tbody) return;

        const urgentDomains = this.domains
            .map(d => ({
                ...d,
                daysLeft: this.getDaysUntilRenewal(d.renewalDate)
            }))
            .filter(d => d.daysLeft <= 30)
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .slice(0, 5);

        tbody.innerHTML = urgentDomains.map(domain => `
            <tr>
                <td>${domain.name}</td>
                <td>${this.formatDate(domain.renewalDate)}</td>
                <td>
                    <span class="status-badge ${this.getStatusClass(domain.daysLeft)}">
                        ${domain.daysLeft} days
                    </span>
                </td>
                <td>$${domain.price}</td>
            </tr>
        `).join('');
    }

    renderDomains() {
        const tbody = document.getElementById('domainsTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.domains.map(domain => {
            const daysLeft = this.getDaysUntilRenewal(domain.renewalDate);
            const status = this.getDomainStatus(daysLeft);
            
            return `
                <tr>
                    <td>${domain.name}</td>
                    <td>${domain.provider}</td>
                    <td>${this.formatDate(domain.renewalDate)}</td>
                    <td>$${domain.price}</td>
                    <td>
                        <span class="status-badge status-${status.class}">
                            ${status.text}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn" onclick="app.editDomain('${domain.id}')" title="Edit">
                                <i data-lucide="edit-2"></i>
                            </button>
                            <button class="action-btn" onclick="app.viewDns('${domain.name}')" title="DNS Records">
                                <i data-lucide="globe"></i>
                            </button>
                            <button class="action-btn" onclick="app.deleteDomain('${domain.id}')" title="Delete">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderProviders() {
        const grid = document.getElementById('providersGrid');
        if (!grid) return;

        grid.innerHTML = this.providers.map(provider => {
            const domainCount = this.domains.filter(d => d.provider === provider.name).length;
            
            return `
                <div class="provider-card">
                    <div class="provider-header">
                        <div class="provider-info">
                            <img src="https://www.google.com/s2/favicons?domain=${provider.url}&sz=64" 
                                 alt="${provider.name}" 
                                 class="provider-logo"
                                 onerror="this.src='https://via.placeholder.com/48?text=${provider.name.charAt(0)}'">
                            <span class="provider-name">${provider.name}</span>
                        </div>
                        <div class="action-buttons">
                            <button class="action-btn" onclick="app.editProvider('${provider.id}')" title="Edit">
                                <i data-lucide="edit-2"></i>
                            </button>
                            <button class="action-btn" onclick="app.deleteProvider('${provider.id}')" title="Delete">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                    <div class="provider-stats">
                        <p><i data-lucide="globe" style="width:14px;height:14px;"></i> Domains: <span>${domainCount}</span></p>
                        <p><i data-lucide="dollar-sign" style="width:14px;height:14px;"></i> Total spent: <span>$${this.getProviderTotal(provider.name)}</span></p>
                    </div>
                    <div class="provider-actions">
                        <a href="${provider.url}" target="_blank" class="btn btn-primary">
                            <i data-lucide="external-link"></i> Visit
                        </a>
                        <button class="btn btn-secondary" onclick="app.viewCredentials('${provider.id}')">
                            <i data-lucide="key"></i> Credentials
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderTools() {
        const tools = [
            { name: 'WHOIS Lookup', icon: 'search', description: 'Check domain availability and WHOIS records', url: '#', tags: ['domains', 'dns'] },
            { name: 'DNS Checker', icon: 'network', description: 'Verify DNS propagation worldwide', url: '#', tags: ['dns'] },
            { name: 'SSL Checker', icon: 'shield', description: 'Validate SSL certificates', url: '#', tags: ['ssl'] },
            { name: 'Email Validator', icon: 'mail', description: 'Verify email addresses', url: '#', tags: ['email'] },
            { name: 'Ping Tool', icon: 'activity', description: 'Check server response time', url: '#', tags: ['hosting'] },
            { name: 'Domain Appraisal', icon: 'trending-up', description: 'Estimate domain value', url: '#', tags: ['domains'] }
        ];

        const grid = document.getElementById('toolsGridContainer');
        if (!grid) return;

        grid.innerHTML = tools.map(tool => `
            <div class="recommendation-card" data-tags="${tool.tags.join(',')}">
                <div class="card-icon">
                    <i data-lucide="${tool.icon}"></i>
                </div>
                <div class="gallery-title">${tool.name}</div>
                <div class="gallery-subtitle">${tool.description}</div>
                <a href="${tool.url}" target="_blank" class="btn btn-primary gallery-action">
                    Open Tool
                </a>
            </div>
        `).join('');

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderNotifications() {
        const container = document.getElementById('notificationsList');
        if (!container) return;

        const notifications = this.generateNotifications();
        
        if (notifications.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No new notifications</p>';
            return;
        }

        container.innerHTML = notifications.map(notif => `
            <div class="notification-item ${notif.type}">
                <p>
                    <strong>${notif.title}</strong><br>
                    <small>${notif.message}</small>
                </p>
                <small class="text-muted">${this.timeAgo(notif.timestamp)}</small>
            </div>
        `).join('');
    }

    generateNotifications() {
        const expiring = this.domains
            .filter(d => this.getDaysUntilRenewal(d.renewalDate) <= 30)
            .map(d => ({
                type: 'expiring',
                title: 'Domain Expiring Soon',
                message: `${d.name} expires in ${this.getDaysUntilRenewal(d.renewalDate)} days`,
                timestamp: new Date().toISOString()
            }));

        return expiring.slice(0, 5);
    }

    initCalendar() {
        const now = new Date();
        this.currentMonth = now.getMonth();
        this.currentYear = now.getFullYear();
        this.renderCalendar();
    }

    renderCalendar() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        
        document.getElementById('currentMonthYear').textContent = 
            `${monthNames[this.currentMonth]} ${this.currentYear}`;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        // Render day names
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        document.getElementById('calendarDayNames').innerHTML = dayNames.map(day => 
            `<div class="calendar-day-name">${day}</div>`
        ).join('');

        // Render days
        let calendarHtml = '';
        for (let i = 0; i < firstDay; i++) {
            calendarHtml += '<div class="calendar-day other-month"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayDomains = this.domains.filter(d => d.renewalDate === dateStr);
            
            calendarHtml += `
                <div class="calendar-day">
                    <div class="day-number">${day}</div>
                    ${dayDomains.map(d => `
                        <div class="calendar-event" title="${d.name}">
                            <i data-lucide="globe"></i>
                            ${d.name}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        document.getElementById('calendarGrid').innerHTML = calendarHtml;
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    navigateCalendar(direction) {
        this.currentMonth += direction;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.renderCalendar();
    }

    openDomainModal(domainId = null) {
        const modal = document.getElementById('domainModal');
        const title = document.getElementById('modalTitle');
        const submitBtn = document.getElementById('formSubmitBtn');
        
        if (domainId) {
            // Edit mode
            const domain = this.domains.find(d => d.id === domainId);
            if (domain) {
                title.textContent = this.translate('editDomain') || 'Edit Domain';
                submitBtn.textContent = this.translate('save') || 'Save';
                this.populateDomainForm(domain);
            }
        } else {
            // Add mode
            title.textContent = this.translate('addNewDomain') || 'Add New Domain';
            submitBtn.textContent = this.translate('addDomain') || 'Add Domain';
            document.getElementById('domainForm').reset();
            document.getElementById('domainId').value = '';
        }
        
        modal.classList.add('active');
    }

    populateDomainForm(domain) {
        document.getElementById('domainId').value = domain.id;
        document.getElementById('domainName').value = domain.name;
        document.getElementById('domainProvider').value = domain.provider;
        document.getElementById('purchaseDate').value = domain.purchaseDate || '';
        document.getElementById('renewalDate').value = domain.renewalDate;
        document.getElementById('purchasePrice').value = domain.purchasePrice || '';
        document.getElementById('renewalPrice').value = domain.price;
        document.getElementById('domainAutoRenew').checked = domain.autoRenew || false;
    }

    async handleDomainSubmit(e) {
        e.preventDefault();
        
        const domainId = document.getElementById('domainId').value;
        const domainData = {
            name: document.getElementById('domainName').value,
            provider: document.getElementById('domainProvider').value,
            renewalDate: document.getElementById('renewalDate').value,
            price: document.getElementById('renewalPrice').value,
            autoRenew: document.getElementById('domainAutoRenew').checked,
            purchaseDate: document.getElementById('purchaseDate').value,
            purchasePrice: document.getElementById('purchasePrice').value
        };

        if (domainId) {
            // Update existing domain
            const index = this.domains.findIndex(d => d.id === domainId);
            if (index !== -1) {
                this.domains[index] = { ...this.domains[index], ...domainData, id: domainId };
                this.showToast('Domain updated successfully');
            }
        } else {
            // Add new domain
            domainData.id = Date.now().toString();
            this.domains.push(domainData);
            this.showToast('Domain added successfully');
        }

        // Save to localStorage
        localStorage.setItem('domains', JSON.stringify(this.domains));
        
        // Close modal and refresh
        this.closeAllModals();
        this.renderDomains();
        this.updateDashboard();
    }

    openProviderModal(providerId = null) {
        const modal = document.getElementById('providerModal');
        const title = document.getElementById('providerModalTitle');
        const submitBtn = document.getElementById('providerFormSubmitBtn');
        
        if (providerId) {
            // Edit mode
            const provider = this.providers.find(p => p.id === providerId);
            if (provider) {
                title.textContent = this.translate('editProvider') || 'Edit Provider';
                submitBtn.textContent = this.translate('save') || 'Save';
                this.populateProviderForm(provider);
            }
        } else {
            // Add mode
            title.textContent = this.translate('addNewProvider') || 'Add New Provider';
            submitBtn.textContent = this.translate('addProvider') || 'Add Provider';
            document.getElementById('providerForm').reset();
            document.getElementById('providerId').value = '';
        }
        
        modal.classList.add('active');
    }

    populateProviderForm(provider) {
        document.getElementById('providerId').value = provider.id;
        document.getElementById('providerName').value = provider.name;
        document.getElementById('providerUrl').value = provider.url;
        document.getElementById('providerUser').value = provider.username || '';
        document.getElementById('providerPass').value = provider.password || '';
        document.getElementById('providerUid').value = provider.userId || '';
    }

    handleProviderSubmit(e) {
        e.preventDefault();
        
        const providerId = document.getElementById('providerId').value;
        const providerData = {
            name: document.getElementById('providerName').value,
            url: document.getElementById('providerUrl').value,
            username: document.getElementById('providerUser').value,
            password: document.getElementById('providerPass').value,
            userId: document.getElementById('providerUid').value
        };

        if (providerId) {
            // Update existing provider
            const index = this.providers.findIndex(p => p.id === providerId);
            if (index !== -1) {
                this.providers[index] = { ...this.providers[index], ...providerData, id: providerId };
                this.showToast('Provider updated successfully');
            }
        } else {
            // Add new provider
            providerData.id = Date.now().toString();
            this.providers.push(providerData);
            this.showToast('Provider added successfully');
        }

        // Save to localStorage
        localStorage.setItem('providers', JSON.stringify(this.providers));
        
        // Close modal and refresh
        this.closeAllModals();
        this.renderProviders();
    }

    deleteDomain(domainId) {
        if (confirm('Are you sure you want to delete this domain?')) {
            this.domains = this.domains.filter(d => d.id !== domainId);
            localStorage.setItem('domains', JSON.stringify(this.domains));
            this.renderDomains();
            this.updateDashboard();
            this.showToast('Domain deleted successfully');
        }
    }

    deleteProvider(providerId) {
        const domainsWithProvider = this.domains.filter(d => d.provider === 
            this.providers.find(p => p.id === providerId)?.name);
        
        if (domainsWithProvider.length > 0) {
            if (!confirm(`This provider has ${domainsWithProvider.length} domains. Deleting it may affect these domains. Continue?`)) {
                return;
            }
        } else {
            if (!confirm('Are you sure you want to delete this provider?')) {
                return;
            }
        }

        this.providers = this.providers.filter(p => p.id !== providerId);
        localStorage.setItem('providers', JSON.stringify(this.providers));
        this.renderProviders();
        this.showToast('Provider deleted successfully');
    }

    editDomain(domainId) {
        this.openDomainModal(domainId);
    }

    editProvider(providerId) {
        this.openProviderModal(providerId);
    }

    viewDns(domainName) {
        const modal = document.getElementById('dnsModal');
        document.getElementById('dnsDomainLabel').textContent = domainName;
        document.getElementById('dnsLoading').style.display = 'block';
        document.getElementById('dnsTableWrapper').style.display = 'none';
        document.getElementById('dnsError').style.display = 'none';
        modal.classList.add('active');

        // Simulate DNS lookup
        setTimeout(() => {
            this.fetchDnsRecords(domainName);
        }, 1500);
    }

    fetchDnsRecords(domainName) {
        const sampleRecords = [
            { type: 'A', value: '192.0.2.1' },
            { type: 'AAAA', value: '2001:db8::1' },
            { type: 'MX', value: 'mail.' + domainName },
            { type: 'NS', value: 'ns1.nameserver.com' },
            { type: 'TXT', value: 'v=spf1 include:_spf.google.com ~all' }
        ];

        document.getElementById('dnsLoading').style.display = 'none';
        document.getElementById('dnsTableWrapper').style.display = 'block';
        
        const tbody = document.getElementById('dnsTableBody');
        tbody.innerHTML = sampleRecords.map(record => `
            <tr>
                <td><span class="dns-badge">${record.type}</span></td>
                <td>${record.value}</td>
            </tr>
        `).join('');
    }

    viewCredentials(providerId) {
        const provider = this.providers.find(p => p.id === providerId);
        if (!provider) return;

        const modal = document.getElementById('credentialsModal');
        document.getElementById('credUser').textContent = provider.username || 'Not set';
        document.getElementById('credPass').textContent = provider.password || 'Not set';
        document.getElementById('credUid').textContent = provider.userId || 'Not set';
        modal.classList.add('active');
    }

    quickDnsCheck() {
        const domain = document.getElementById('quickDnsInput').value.trim();
        if (!domain) {
            this.showToast('Please enter a domain name', 'warning');
            return;
        }
        this.viewDns(domain);
    }

    filterTools(e) {
        const tag = e.currentTarget.dataset.tag;
        
        // Update active state
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Filter cards
        const cards = document.querySelectorAll('#toolsGridContainer .recommendation-card');
        cards.forEach(card => {
            if (tag === 'all') {
                card.style.display = 'flex';
            } else {
                const cardTags = card.dataset.tags?.split(',') || [];
                card.style.display = cardTags.includes(tag) ? 'flex' : 'none';
            }
        });
    }

    async fetchWhois() {
        const domain = document.getElementById('domainName').value.trim();
        if (!domain) {
            this.showToast('Please enter a domain name', 'warning');
            return;
        }

        const status = document.getElementById('whoisStatus');
        status.style.display = 'block';
        status.textContent = 'Fetching WHOIS data...';

        // Simulate WHOIS fetch
        setTimeout(() => {
            const randomDate = new Date();
            randomDate.setFullYear(randomDate.getFullYear() + 1);
            
            document.getElementById('renewalDate').value = randomDate.toISOString().split('T')[0];
            document.getElementById('purchaseDate').value = new Date().toISOString().split('T')[0];
            
            status.textContent = 'Domain information auto-filled!';
            status.style.color = 'var(--success)';
            
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        }, 2000);
    }

    handleSearch(query) {
        if (!query) {
            this.renderDomains();
            return;
        }

        const filtered = this.domains.filter(d => 
            d.name.toLowerCase().includes(query.toLowerCase()) ||
            d.provider.toLowerCase().includes(query.toLowerCase())
        );

        const tbody = document.getElementById('domainsTableBody');
        if (tbody) {
            tbody.innerHTML = filtered.map(domain => {
                const daysLeft = this.getDaysUntilRenewal(domain.renewalDate);
                const status = this.getDomainStatus(daysLeft);
                
                return `
                    <tr>
                        <td>${domain.name}</td>
                        <td>${domain.provider}</td>
                        <td>${this.formatDate(domain.renewalDate)}</td>
                        <td>$${domain.price}</td>
                        <td>
                            <span class="status-badge status-${status.class}">
                                ${status.text}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn" onclick="app.editDomain('${domain.id}')">
                                    <i data-lucide="edit-2"></i>
                                </button>
                                <button class="action-btn" onclick="app.viewDns('${domain.name}')">
                                    <i data-lucide="globe"></i>
                                </button>
                                <button class="action-btn" onclick="app.deleteDomain('${domain.id}')">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            if (window.lucide) {
                lucide.createIcons();
            }
        }
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'es' : 'en';
        this.applyTranslations();
        this.showToast(`Language changed to ${this.currentLang === 'en' ? 'English' : 'Spanish'}`);
    }

    applyTranslations() {
        const elements = document.querySelectorAll('[data-translate-key]');
        elements.forEach(el => {
            const key = el.dataset.translateKey;
            const translation = this.translations[this.currentLang][key];
            if (translation) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });
    }

    translate(key) {
        return this.translations[this.currentLang][key];
    }

    togglePasswordVisibility(e) {
        const icon = e.currentTarget;
        const input = icon.previousElementSibling;
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.setAttribute('data-lucide', 'eye-off');
        } else {
            input.type = 'password';
            icon.setAttribute('data-lucide', 'eye');
        }
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    setupFlipCards() {
        document.querySelectorAll('.flip-card').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('is-flipped');
            });
        });
    }

    setupMobileNavigation() {
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const navOverlay = document.querySelector('.nav-overlay');
        const mobileNavClose = document.querySelector('.mobile-nav-close');

        if (menuToggle && sidebar && navOverlay) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.add('active');
                navOverlay.classList.add('active');
            });

            navOverlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                navOverlay.classList.remove('active');
            });

            if (mobileNavClose) {
                mobileNavClose.addEventListener('click', () => {
                    sidebar.classList.remove('active');
                    navOverlay.classList.remove('active');
                });
            }
        }

        // Clone menu for mobile
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav) {
            const sidebarMenu = document.querySelector('.sidebar-menu');
            if (sidebarMenu) {
                const menuClone = sidebarMenu.cloneNode(true);
                menuClone.classList.add('mobile-menu');
                mobileNav.appendChild(menuClone);
            }
        }
    }

    syncWithGoogleCalendar() {
        this.showToast('Google Calendar sync feature coming soon!', 'info');
    }

    downloadIcs() {
        // Generate ICS file with domain renewals
        let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Domain Vault//EN\n';
        
        this.domains.forEach(domain => {
            const renewalDate = new Date(domain.renewalDate);
            const uid = `${domain.id}@domainvault.com`;
            
            icsContent += 'BEGIN:VEVENT\n';
            icsContent += `UID:${uid}\n`;
            icsContent += `DTSTART:${this.formatICSDate(renewalDate)}\n`;
            icsContent += `SUMMARY:Domain Renewal: ${domain.name}\n`;
            icsContent += `DESCRIPTION:Renew domain ${domain.name} for $${domain.price}\n`;
            icsContent += 'END:VEVENT\n';
        });
        
        icsContent += 'END:VCALENDAR';

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'domain-renewals.ics';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('ICS file downloaded');
    }

    formatICSDate(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    handleProfileSubmit(e) {
        e.preventDefault();
        const username = document.getElementById('settingUsername').value;
        if (username) {
            document.getElementById('userName').textContent = username;
            this.showToast('Profile updated successfully');
        }
    }

    changeAccentColor(e) {
        const color = e.currentTarget.dataset.color;
        this.setAccentColor(color);
        
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        e.currentTarget.classList.add('active');
    }

    setAccentColor(color) {
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--primary-rgb', this.hexToRgb(color));
        localStorage.setItem('accentColor', color);
        this.showToast('Accent color updated');
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '255, 80, 17';
    }

    handleProfilePictureUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('userAvatar').style.backgroundImage = `url('${e.target.result}')`;
                document.getElementById('settingsAvatarPreview').style.backgroundImage = `url('${e.target.result}')`;
                document.getElementById('userAvatar').textContent = '';
                this.showToast('Profile picture updated');
            };
            reader.readAsDataURL(file);
        }
    }

    removeProfilePicture() {
        document.getElementById('userAvatar').style.backgroundImage = '';
        document.getElementById('settingsAvatarPreview').style.backgroundImage = '';
        document.getElementById('userAvatar').textContent = 'JD';
        this.showToast('Profile picture removed');
    }

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        this.showToast(`Theme switched to ${document.body.classList.contains('light-theme') ? 'light' : 'dark'} mode`);
    }

    checkAuth() {
        // Simulate authentication
        this.currentUser = { name: 'John Doe', email: 'john@example.com' };
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userAvatar').textContent = this.currentUser.name.split(' ').map(n => n[0]).join('');
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.currentUser = null;
            location.reload();
        }
    }

    renderExpensesChart() {
        const ctx = document.getElementById('expensesChart')?.getContext('2d');
        if (!ctx) return;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = new Array(12).fill(0);

        this.domains.forEach(domain => {
            const month = new Date(domain.renewalDate).getMonth();
            data[month] += parseFloat(domain.price);
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Renewal Costs ($)',
                    data: data,
                    backgroundColor: 'rgba(255, 80, 17, 0.8)',
                    borderColor: '#ff5011',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'var(--text-muted)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'var(--text-muted)'
                        }
                    }
                }
            }
        });
    }

    renderProvidersChart() {
        const ctx = document.getElementById('providersChart')?.getContext('2d');
        if (!ctx) return;

        const providerCounts = {};
        this.domains.forEach(domain => {
            providerCounts[domain.provider] = (providerCounts[domain.provider] || 0) + 1;
        });

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(providerCounts),
                datasets: [{
                    data: Object.values(providerCounts),
                    backgroundColor: [
                        '#ff5011',
                        '#ff7433',
                        '#ff9833',
                        '#ffbc33',
                        '#ffe033'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--text-muted)',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    loadSettings() {
        // Load saved accent color
        const savedColor = localStorage.getItem('accentColor');
        if (savedColor) {
            this.setAccentColor(savedColor);
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }
    }

    initializeUI() {
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Set current year in footer
        const footer = document.querySelector('.main-footer p');
        if (footer) {
            footer.innerHTML = `Powered by Project Freedom ✊ ${new Date().getFullYear()}`;
        }

        // Apply translations
        this.applyTranslations();
    }

    renderSampleData() {
        this.updateDashboard();
        this.renderDomains();
        this.renderProviders();
        this.renderTools();
        this.initCalendar();
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add('show');
        
        // Set color based on type
        toast.style.borderLeftColor = type === 'error' ? 'var(--danger)' : 
                                      type === 'warning' ? 'var(--warning)' : 
                                      'var(--primary)';

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    getDaysUntilRenewal(renewalDate) {
        const today = new Date();
        const renewal = new Date(renewalDate);
        const diffTime = renewal - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getDomainStatus(daysLeft) {
        if (daysLeft < 0) {
            return { class: 'expired', text: this.translate('expired') || 'Expired' };
        } else if (daysLeft <= 30) {
            return { class: 'warning', text: this.translate('expiring') || 'Expiring Soon' };
        } else {
            return { class: 'active', text: this.translate('active') || 'Active' };
        }
    }

    getStatusClass(daysLeft) {
        if (daysLeft < 0) return 'expired';
        if (daysLeft <= 30) return 'warning';
        return 'active';
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }

    getProviderTotal(providerName) {
        return this.domains
            .filter(d => d.provider === providerName)
            .reduce((sum, d) => sum + parseFloat(d.price), 0)
            .toFixed(2);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DomainVault();
});
