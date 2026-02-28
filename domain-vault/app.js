// Domain Vault Application with Firebase
class DomainVault {
    constructor() {
        this.currentUser = null;
        this.domains = [];
        this.providers = [];
        this.notifications = [];
        this.db = null;
        this.auth = null;
        this.firebaseInitialized = false;
        
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
                footer: 'Powered by Project Freedom ✊',
                login: 'Login',
                signup: 'Sign Up',
                email: 'Email',
                password: 'Password',
                confirmPassword: 'Confirm Password',
                logout: 'Logout',
                welcome: 'Welcome'
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
                footer: 'Desarrollado por Project Freedom ✊',
                login: 'Iniciar Sesión',
                signup: 'Registrarse',
                email: 'Correo',
                password: 'Contraseña',
                confirmPassword: 'Confirmar Contraseña',
                logout: 'Cerrar Sesión',
                welcome: 'Bienvenido'
            }
        };
        this.currentLang = 'en';
        
        // Hide loading immediately when constructor runs
        this.hideLoading();
        
        // Initialize the app
        this.init();
    }

    // Method to hide loading indicator
    hideLoading() {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    async init() {
        try {
            // Initialize Firebase first
            await this.initializeFirebase();
            
            // Then load data and setup UI
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
            this.showToast('Error initializing application: ' + error.message, 'error');
            this.hideLoading();
        }
    }

    async initializeFirebase() {
        try {
            // Import Firebase modules dynamically
            const { initializeApp } = await import('firebase/app');
            const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } = await import('firebase/auth');
            const { getFirestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } = await import('firebase/firestore');

            // YOUR FIREBASE CONFIGURATION - REPLACE WITH YOUR ACTUAL VALUES
            const firebaseConfig = {
                apiKey: "YOUR_API_KEY_HERE",
                authDomain: "YOUR_AUTH_DOMAIN_HERE",
                projectId: "YOUR_PROJECT_ID_HERE",
                storageBucket: "YOUR_STORAGE_BUCKET_HERE",
                messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
                appId: "YOUR_APP_ID_HERE"
            };

            // Initialize Firebase
            const app = initializeApp(firebaseConfig);
            this.auth = getAuth(app);
            this.db = getFirestore(app);
            this.firebaseInitialized = true;

            // Set up auth state observer
            onAuthStateChanged(this.auth, (user) => {
                if (user) {
                    this.currentUser = user;
                    this.handleAuthenticatedUser(user);
                } else {
                    this.currentUser = null;
                    this.showAuthUI();
                }
            });

            console.log('Firebase initialized successfully');
        } catch (error) {
            console.error('Firebase initialization error:', error);
            this.showToast('Firebase initialization failed. Using local storage fallback.', 'warning');
            this.firebaseInitialized = false;
        }
    }

    handleAuthenticatedUser(user) {
        // Hide auth container
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            authContainer.style.display = 'none';
        }

        // Update UI with user info
        const userNameEl = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (userNameEl) {
            userNameEl.textContent = user.displayName || user.email?.split('@')[0] || 'User';
        }
        
        if (userAvatar && !userAvatar.style.backgroundImage) {
            const initials = (user.displayName || user.email || 'User')
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            userAvatar.textContent = initials;
        }

        // Show logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
        }

        // Load user data from Firestore
        this.loadUserData();
    }

    showAuthUI() {
        const authContainer = document.getElementById('authContainer');
        if (!authContainer) return;

        authContainer.style.display = 'flex';
        authContainer.innerHTML = this.renderAuthUI();
        
        // Hide logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }

        // Setup auth event listeners
        this.setupAuthListeners();
        
        // Initialize icons in auth UI
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderAuthUI() {
        return `
            <div class="auth-box">
                <h2>${this.translate('welcome')} 👋</h2>
                <div id="authMessage" class="auth-error" style="display: none;"></div>
                
                <form id="loginForm" style="display: block;">
                    <div class="form-group">
                        <input type="email" id="loginEmail" class="form-control" placeholder="${this.translate('email')}" required>
                    </div>
                    <div class="form-group">
                        <div class="password-wrapper">
                            <input type="password" id="loginPassword" class="form-control" placeholder="${this.translate('password')}" required>
                            <i data-lucide="eye" class="toggle-password"></i>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" id="loginBtn">${this.translate('login')}</button>
                </form>

                <form id="signupForm" style="display: none;">
                    <div class="form-group">
                        <input type="email" id="signupEmail" class="form-control" placeholder="${this.translate('email')}" required>
                    </div>
                    <div class="form-group">
                        <div class="password-wrapper">
                            <input type="password" id="signupPassword" class="form-control" placeholder="${this.translate('password')}" required>
                            <i data-lucide="eye" class="toggle-password"></i>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="password-wrapper">
                            <input type="password" id="signupConfirmPassword" class="form-control" placeholder="${this.translate('confirmPassword')}" required>
                            <i data-lucide="eye" class="toggle-password"></i>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" id="signupBtn">${this.translate('signup')}</button>
                </form>

                <div class="auth-toggle">
                    <a href="#" id="toggleAuthMode">${this.translate('signup')}</a>
                </div>
            </div>
        `;
    }

    setupAuthListeners() {
        // Toggle between login and signup
        const toggleLink = document.getElementById('toggleAuthMode');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (toggleLink) {
            toggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (loginForm.style.display === 'none') {
                    loginForm.style.display = 'block';
                    signupForm.style.display = 'none';
                    toggleLink.textContent = this.translate('signup');
                } else {
                    loginForm.style.display = 'none';
                    signupForm.style.display = 'block';
                    toggleLink.textContent = this.translate('login');
                }
            });
        }

        // Login form submit
        const loginFormElement = document.getElementById('loginForm');
        if (loginFormElement) {
            loginFormElement.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }

        // Signup form submit
        const signupFormElement = document.getElementById('signupForm');
        if (signupFormElement) {
            signupFormElement.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignup();
            });
        }

        // Password toggle
        document.querySelectorAll('#authContainer .toggle-password').forEach(icon => {
            icon.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;
        const messageEl = document.getElementById('authMessage');

        if (!email || !password) {
            this.showAuthMessage('Please enter email and password', 'error');
            return;
        }

        try {
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            await signInWithEmailAndPassword(this.auth, email, password);
        } catch (error) {
            console.error('Login error:', error);
            this.showAuthMessage(this.getAuthErrorMessage(error), 'error');
        }
    }

    async handleSignup() {
        const email = document.getElementById('signupEmail')?.value;
        const password = document.getElementById('signupPassword')?.value;
        const confirmPassword = document.getElementById('signupConfirmPassword')?.value;

        if (!email || !password || !confirmPassword) {
            this.showAuthMessage('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showAuthMessage('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showAuthMessage('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            const { createUserWithEmailAndPassword } = await import('firebase/auth');
            await createUserWithEmailAndPassword(this.auth, email, password);
        } catch (error) {
            console.error('Signup error:', error);
            this.showAuthMessage(this.getAuthErrorMessage(error), 'error');
        }
    }

    showAuthMessage(message, type) {
        const messageEl = document.getElementById('authMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = type === 'error' ? 'auth-error' : 'auth-success';
            messageEl.style.display = 'block';
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }

    getAuthErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/user-disabled':
                return 'This account has been disabled';
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/email-already-in-use':
                return 'Email already in use';
            case 'auth/weak-password':
                return 'Password is too weak';
            default:
                return 'Authentication failed. Please try again.';
        }
    }

    async loadUserData() {
        if (!this.firebaseInitialized || !this.currentUser) {
            // Fallback to localStorage
            await this.loadInitialData();
            this.renderSampleData();
            return;
        }

        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            
            // Load domains
            const domainsQuery = query(
                collection(this.db, 'domains'),
                where('userId', '==', this.currentUser.uid)
            );
            const domainsSnapshot = await getDocs(domainsQuery);
            const firebaseDomains = domainsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Load providers
            const providersQuery = query(
                collection(this.db, 'providers'),
                where('userId', '==', this.currentUser.uid)
            );
            const providersSnapshot = await getDocs(providersQuery);
            const firebaseProviders = providersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Merge with localStorage data
            if (firebaseDomains.length > 0) {
                this.domains = firebaseDomains;
            } else {
                // Try to load from localStorage first
                await this.loadInitialData();
                // Save local data to Firebase
                for (const domain of this.domains) {
                    await this.saveDomain(domain);
                }
                for (const provider of this.providers) {
                    await this.saveProvider(provider);
                }
            }

            if (firebaseProviders.length > 0) {
                this.providers = firebaseProviders;
            }

            // Render UI
            this.renderSampleData();
            
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showToast('Error loading data from Firebase', 'error');
            
            // Fallback to localStorage
            await this.loadInitialData();
            this.renderSampleData();
        }
    }

    async saveDomain(domainData) {
        if (this.firebaseInitialized && this.currentUser) {
            try {
                const { collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
                
                const dataWithUser = {
                    ...domainData,
                    userId: this.currentUser.uid,
                    updatedAt: new Date().toISOString()
                };

                if (domainData.id && !domainData.id.toString().startsWith('temp_')) {
                    // Update
                    const docRef = doc(this.db, 'domains', domainData.id);
                    await updateDoc(docRef, dataWithUser);
                } else {
                    // Add
                    dataWithUser.createdAt = new Date().toISOString();
                    const docRef = await addDoc(collection(this.db, 'domains'), dataWithUser);
                    domainData.id = docRef.id;
                }
            } catch (error) {
                console.error('Error saving to Firebase:', error);
                this.showToast('Error saving to cloud', 'error');
            }
        }
        
        // Also save to localStorage as backup
        localStorage.setItem('domains', JSON.stringify(this.domains));
    }

    async saveProvider(providerData) {
        if (this.firebaseInitialized && this.currentUser) {
            try {
                const { collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
                
                const dataWithUser = {
                    ...providerData,
                    userId: this.currentUser.uid,
                    updatedAt: new Date().toISOString()
                };

                if (providerData.id && !providerData.id.toString().startsWith('temp_')) {
                    // Update
                    const docRef = doc(this.db, 'providers', providerData.id);
                    await updateDoc(docRef, dataWithUser);
                } else {
                    // Add
                    dataWithUser.createdAt = new Date().toISOString();
                    const docRef = await addDoc(collection(this.db, 'providers'), dataWithUser);
                    providerData.id = docRef.id;
                }
            } catch (error) {
                console.error('Error saving to Firebase:', error);
                this.showToast('Error saving to cloud', 'error');
            }
        }
        
        // Also save to localStorage as backup
        localStorage.setItem('providers', JSON.stringify(this.providers));
    }

    async deleteDomain(domainId) {
        if (confirm('Are you sure you want to delete this domain?')) {
            if (this.firebaseInitialized && this.currentUser) {
                try {
                    const { doc, deleteDoc } = await import('firebase/firestore');
                    const docRef = doc(this.db, 'domains', domainId);
                    await deleteDoc(docRef);
                } catch (error) {
                    console.error('Error deleting from Firebase:', error);
                    this.showToast('Error deleting from cloud', 'error');
                }
            }

            this.domains = this.domains.filter(d => d.id !== domainId);
            localStorage.setItem('domains', JSON.stringify(this.domains));
            this.renderDomains();
            this.updateDashboard();
            this.showToast('Domain deleted successfully');
        }
    }

    async deleteProvider(providerId) {
        const provider = this.providers.find(p => p.id === providerId);
        if (!provider) return;

        const domainsWithProvider = this.domains.filter(d => d.provider === provider.name);
        
        if (domainsWithProvider.length > 0) {
            if (!confirm(`This provider has ${domainsWithProvider.length} domains. Deleting it may affect these domains. Continue?`)) {
                return;
            }
        } else {
            if (!confirm('Are you sure you want to delete this provider?')) {
                return;
            }
        }

        if (this.firebaseInitialized && this.currentUser) {
            try {
                const { doc, deleteDoc } = await import('firebase/firestore');
                const docRef = doc(this.db, 'providers', providerId);
                await deleteDoc(docRef);
            } catch (error) {
                console.error('Error deleting from Firebase:', error);
                this.showToast('Error deleting from cloud', 'error');
            }
        }

        this.providers = this.providers.filter(p => p.id !== providerId);
        localStorage.setItem('providers', JSON.stringify(this.providers));
        this.renderProviders();
        this.showToast('Provider deleted successfully');
    }

    async logout() {
        if (confirm('Are you sure you want to logout?')) {
            if (this.firebaseInitialized) {
                try {
                    const { signOut } = await import('firebase/auth');
                    await signOut(this.auth);
                } catch (error) {
                    console.error('Logout error:', error);
                }
            }
            this.currentUser = null;
            location.reload();
        }
    }

    async loadInitialData() {
        // Load providers from localStorage or use defaults
        const savedProviders = localStorage.getItem('providers');
        if (savedProviders) {
            try {
                this.providers = JSON.parse(savedProviders);
            } catch (e) {
                console.error('Error parsing providers:', e);
                this.providers = this.getDefaultProviders();
            }
        } else {
            this.providers = this.getDefaultProviders();
        }

        // Load domains from localStorage or use defaults
        const savedDomains = localStorage.getItem('domains');
        if (savedDomains) {
            try {
                this.domains = JSON.parse(savedDomains);
            } catch (e) {
                console.error('Error parsing domains:', e);
                this.domains = this.generateSampleDomains();
            }
        } else {
            this.domains = this.generateSampleDomains();
        }
    }

    getDefaultProviders() {
        return [
            { id: 'temp_1', name: 'Namecheap', url: 'https://www.namecheap.com', username: '', password: '', userId: '' },
            { id: 'temp_2', name: 'GoDaddy', url: 'https://www.godaddy.com', username: '', password: '', userId: '' },
            { id: 'temp_3', name: 'Google Domains', url: 'https://domains.google', username: '', password: '', userId: '' },
            { id: 'temp_4', name: 'Cloudflare', url: 'https://www.cloudflare.com', username: '', password: '', userId: '' }
        ];
    }

    generateSampleDomains() {
        const providers = ['Namecheap', 'GoDaddy', 'Google Domains', 'Cloudflare'];
        const domains = [];
        const today = new Date();

        for (let i = 1; i <= 12; i++) {
            const renewalDate = new Date(today);
            renewalDate.setMonth(today.getMonth() + Math.floor(Math.random() * 12) + 1);
            
            domains.push({
                id: `temp_${i}`,
                name: `example${i}.com`,
                provider: providers[Math.floor(Math.random() * providers.length)],
                renewalDate: renewalDate.toISOString().split('T')[0],
                price: (Math.random() * 20 + 8).toFixed(2),
                purchaseDate: today.toISOString().split('T')[0],
                purchasePrice: (Math.random() * 15 + 5).toFixed(2),
                autoRenew: Math.random() > 0.5
            });
        }
        return domains;
    }

    // ALL YOUR EXISTING METHODS BELOW - COMPLETELY UNCHANGED
    setupEventListeners() {
        // Menu navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Add domain buttons
        document.querySelectorAll('#addDomainBtn, #addDomainBtnSecondary').forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.openDomainModal());
            }
        });

        // Add provider button
        const addProviderBtn = document.getElementById('addProviderBtn');
        if (addProviderBtn) {
            addProviderBtn.addEventListener('click', () => this.openProviderModal());
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Translate button
        const translateBtn = document.getElementById('translateBtn');
        if (translateBtn) {
            translateBtn.addEventListener('click', () => this.toggleLanguage());
        }

        // Notification icon
        const notificationIcon = document.getElementById('headerNotificationIcon');
        if (notificationIcon) {
            notificationIcon.addEventListener('click', () => {
                const notifMenuItem = document.querySelector('[data-page="notifications"]');
                if (notifMenuItem) notifMenuItem.click();
            });
        }

        // User avatar click
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.addEventListener('click', () => {
                const settingsMenuItem = document.querySelector('[data-page="settings"]');
                if (settingsMenuItem) settingsMenuItem.click();
            });
        }

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
        const domainForm = document.getElementById('domainForm');
        if (domainForm) {
            domainForm.addEventListener('submit', (e) => this.handleDomainSubmit(e));
        }

        // Provider form submit
        const providerForm = document.getElementById('providerForm');
        if (providerForm) {
            providerForm.addEventListener('submit', (e) => this.handleProviderSubmit(e));
        }

        // Password toggle
        document.querySelectorAll('.toggle-password:not(#authContainer .toggle-password)').forEach(icon => {
            icon.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });

        // Fetch WHOIS
        const fetchWhoisBtn = document.getElementById('fetchWhoisBtn');
        if (fetchWhoisBtn) {
            fetchWhoisBtn.addEventListener('click', () => this.fetchWhois());
        }

        // Calendar navigation
        const prevMonthBtn = document.getElementById('prevMonthBtn');
        const nextMonthBtn = document.getElementById('nextMonthBtn');
        if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => this.navigateCalendar(-1));
        if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => this.navigateCalendar(1));

        // Sync calendar buttons
        const syncGCalBtn = document.getElementById('syncGCalBtn');
        const downloadIcsBtn = document.getElementById('downloadIcsBtn');
        if (syncGCalBtn) syncGCalBtn.addEventListener('click', () => this.syncWithGoogleCalendar());
        if (downloadIcsBtn) downloadIcsBtn.addEventListener('click', () => this.downloadIcs());

        // Quick DNS check
        const quickDnsBtn = document.getElementById('quickDnsBtn');
        if (quickDnsBtn) {
            quickDnsBtn.addEventListener('click', () => this.quickDnsCheck());
        }

        // Filter tags for tools
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.filterTools(e));
        });

        // Settings profile form
        const settingsProfileForm = document.getElementById('settingsProfileForm');
        if (settingsProfileForm) {
            settingsProfileForm.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        }

        // Color palette
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => this.changeAccentColor(e));
        });

        // Custom color picker
        const customColorPicker = document.getElementById('customColorPicker');
        if (customColorPicker) {
            customColorPicker.addEventListener('change', (e) => {
                this.setAccentColor(e.target.value);
            });
        }

        // Upload profile picture
        const uploadPicBtn = document.getElementById('uploadPicBtn');
        const profilePicUpload = document.getElementById('profilePicUpload');
        if (uploadPicBtn && profilePicUpload) {
            uploadPicBtn.addEventListener('click', () => {
                profilePicUpload.click();
            });
            profilePicUpload.addEventListener('change', (e) => this.handleProfilePictureUpload(e));
        }

        // Remove profile picture
        const removePicBtn = document.getElementById('removePicBtn');
        if (removePicBtn) {
            removePicBtn.addEventListener('click', () => this.removeProfilePicture());
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    handleNavigation(e) {
        const menuItem = e.currentTarget;
        const pageId = menuItem.dataset.page;
        
        // Update active menu
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        menuItem.classList.add('active');
        
        // Show selected page
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(`page-${pageId}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
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
        const totalInvestment = this.domains.reduce((sum, d) => sum + (parseFloat(d.purchasePrice) || parseFloat(d.price)), 0);

        const totalDomainsEl = document.getElementById('stat-total-domains');
        const providersEl = document.getElementById('stat-domain-providers');
        const yearlyEl = document.getElementById('stat-yearly-expenses');
        const investmentEl = document.getElementById('stat-total-investment');
        const expiringEl = document.getElementById('stat-expiring-soon');

        if (totalDomainsEl) totalDomainsEl.textContent = totalDomains;
        if (providersEl) providersEl.textContent = uniqueProviders;
        if (yearlyEl) yearlyEl.textContent = `$${yearlyTotal.toFixed(2)}`;
        if (investmentEl) investmentEl.textContent = `$${totalInvestment.toFixed(2)}`;
        if (expiringEl) expiringEl.textContent = expiringSoon;

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

        if (urgentDomains.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-muted text-center">No urgent renewals</td></tr>';
            return;
        }

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

        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderDomains() {
        const tbody = document.getElementById('domainsTableBody');
        if (!tbody) return;

        if (this.domains.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center">No domains added yet</td></tr>';
            return;
        }

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

        if (this.providers.length === 0) {
            grid.innerHTML = '<p class="text-muted text-center">No providers added yet</p>';
            return;
        }

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
        
        const monthYearEl = document.getElementById('currentMonthYear');
        if (monthYearEl) {
            monthYearEl.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }

        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        // Render day names
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayNamesEl = document.getElementById('calendarDayNames');
        if (dayNamesEl) {
            dayNamesEl.innerHTML = dayNames.map(day => 
                `<div class="calendar-day-name">${day}</div>`
            ).join('');
        }

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

        const calendarGrid = document.getElementById('calendarGrid');
        if (calendarGrid) {
            calendarGrid.innerHTML = calendarHtml;
        }
        
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
                if (title) title.textContent = 'Edit Domain';
                if (submitBtn) submitBtn.textContent = 'Save Changes';
                this.populateDomainForm(domain);
            }
        } else {
            // Add mode
            if (title) title.textContent = 'Add New Domain';
            if (submitBtn) submitBtn.textContent = 'Add Domain';
            const form = document.getElementById('domainForm');
            if (form) form.reset();
            const domainIdField = document.getElementById('domainId');
            if (domainIdField) domainIdField.value = '';
        }
        
        if (modal) modal.classList.add('active');
    }

    populateDomainForm(domain) {
        const domainIdField = document.getElementById('domainId');
        const domainNameField = document.getElementById('domainName');
        const domainProviderField = document.getElementById('domainProvider');
        const purchaseDateField = document.getElementById('purchaseDate');
        const renewalDateField = document.getElementById('renewalDate');
        const purchasePriceField = document.getElementById('purchasePrice');
        const renewalPriceField = document.getElementById('renewalPrice');
        const autoRenewField = document.getElementById('domainAutoRenew');

        if (domainIdField) domainIdField.value = domain.id;
        if (domainNameField) domainNameField.value = domain.name;
        if (domainProviderField) domainProviderField.value = domain.provider;
        if (purchaseDateField) purchaseDateField.value = domain.purchaseDate || '';
        if (renewalDateField) renewalDateField.value = domain.renewalDate;
        if (purchasePriceField) purchasePriceField.value = domain.purchasePrice || '';
        if (renewalPriceField) renewalPriceField.value = domain.price;
        if (autoRenewField) autoRenewField.checked = domain.autoRenew || false;
    }

    async handleDomainSubmit(e) {
        e.preventDefault();
        
        const domainId = document.getElementById('domainId')?.value;
        const domainData = {
            name: document.getElementById('domainName')?.value,
            provider: document.getElementById('domainProvider')?.value,
            renewalDate: document.getElementById('renewalDate')?.value,
            price: document.getElementById('renewalPrice')?.value,
            autoRenew: document.getElementById('domainAutoRenew')?.checked || false,
            purchaseDate: document.getElementById('purchaseDate')?.value,
            purchasePrice: document.getElementById('purchasePrice')?.value
        };

        if (!domainData.name || !domainData.provider || !domainData.renewalDate || !domainData.price) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (domainId && !domainId.startsWith('temp_')) {
            // Update existing domain
            const index = this.domains.findIndex(d => d.id === domainId);
            if (index !== -1) {
                this.domains[index] = { ...this.domains[index], ...domainData, id: domainId };
                this.saveDomain(this.domains[index]);
                this.showToast('Domain updated successfully');
            }
        } else {
            // Add new domain
            domainData.id = 'temp_' + Date.now().toString();
            this.domains.push(domainData);
            this.saveDomain(domainData);
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
                if (title) title.textContent = 'Edit Provider';
                if (submitBtn) submitBtn.textContent = 'Save Changes';
                this.populateProviderForm(provider);
            }
        } else {
            // Add mode
            if (title) title.textContent = 'Add New Provider';
            if (submitBtn) submitBtn.textContent = 'Add Provider';
            const form = document.getElementById('providerForm');
            if (form) form.reset();
            const providerIdField = document.getElementById('providerId');
            if (providerIdField) providerIdField.value = '';
        }
        
        if (modal) modal.classList.add('active');
    }

    populateProviderForm(provider) {
        const providerIdField = document.getElementById('providerId');
        const providerNameField = document.getElementById('providerName');
        const providerUrlField = document.getElementById('providerUrl');
        const providerUserField = document.getElementById('providerUser');
        const providerPassField = document.getElementById('providerPass');
        const providerUidField = document.getElementById('providerUid');

        if (providerIdField) providerIdField.value = provider.id;
        if (providerNameField) providerNameField.value = provider.name;
        if (providerUrlField) providerUrlField.value = provider.url;
        if (providerUserField) providerUserField.value = provider.username || '';
        if (providerPassField) providerPassField.value = provider.password || '';
        if (providerUidField) providerUidField.value = provider.userId || '';
    }

    async handleProviderSubmit(e) {
        e.preventDefault();
        
        const providerId = document.getElementById('providerId')?.value;
        const providerData = {
            name: document.getElementById('providerName')?.value,
            url: document.getElementById('providerUrl')?.value,
            username: document.getElementById('providerUser')?.value,
            password: document.getElementById('providerPass')?.value,
            userId: document.getElementById('providerUid')?.value
        };

        if (!providerData.name || !providerData.url) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (providerId && !providerId.startsWith('temp_')) {
            // Update existing provider
            const index = this.providers.findIndex(p => p.id === providerId);
            if (index !== -1) {
                this.providers[index] = { ...this.providers[index], ...providerData, id: providerId };
                this.saveProvider(this.providers[index]);
                this.showToast('Provider updated successfully');
            }
        } else {
            // Add new provider
            providerData.id = 'temp_' + Date.now().toString();
            this.providers.push(providerData);
            this.saveProvider(providerData);
            this.showToast('Provider added successfully');
        }

        // Save to localStorage
        localStorage.setItem('providers', JSON.stringify(this.providers));
        
        // Close modal and refresh
        this.closeAllModals();
        this.renderProviders();
    }

    editDomain(domainId) {
        this.openDomainModal(domainId);
    }

    editProvider(providerId) {
        this.openProviderModal(providerId);
    }

    viewDns(domainName) {
        const modal = document.getElementById('dnsModal');
        const domainLabel = document.getElementById('dnsDomainLabel');
        const loading = document.getElementById('dnsLoading');
        const tableWrapper = document.getElementById('dnsTableWrapper');
        const error = document.getElementById('dnsError');

        if (domainLabel) domainLabel.textContent = domainName;
        if (loading) loading.style.display = 'block';
        if (tableWrapper) tableWrapper.style.display = 'none';
        if (error) error.style.display = 'none';
        if (modal) modal.classList.add('active');

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

        const loading = document.getElementById('dnsLoading');
        const tableWrapper = document.getElementById('dnsTableWrapper');
        const tbody = document.getElementById('dnsTableBody');

        if (loading) loading.style.display = 'none';
        if (tableWrapper) tableWrapper.style.display = 'block';
        
        if (tbody) {
            tbody.innerHTML = sampleRecords.map(record => `
                <tr>
                    <td><span class="dns-badge">${record.type}</span></td>
                    <td>${record.value}</td>
                </tr>
            `).join('');
        }
    }

    viewCredentials(providerId) {
        const provider = this.providers.find(p => p.id === providerId);
        if (!provider) return;

        const modal = document.getElementById('credentialsModal');
        const credUser = document.getElementById('credUser');
        const credPass = document.getElementById('credPass');
        const credUid = document.getElementById('credUid');

        if (credUser) credUser.textContent = provider.username || 'Not set';
        if (credPass) credPass.textContent = provider.password || 'Not set';
        if (credUid) credUid.textContent = provider.userId || 'Not set';
        if (modal) modal.classList.add('active');
    }

    quickDnsCheck() {
        const input = document.getElementById('quickDnsInput');
        if (!input) return;
        
        const domain = input.value.trim();
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
        const domainInput = document.getElementById('domainName');
        if (!domainInput) return;
        
        const domain = domainInput.value.trim();
        if (!domain) {
            this.showToast('Please enter a domain name', 'warning');
            return;
        }

        const status = document.getElementById('whoisStatus');
        if (status) {
            status.style.display = 'block';
            status.textContent = 'Fetching WHOIS data...';
            status.style.color = 'var(--primary)';
        }

        // Simulate WHOIS fetch
        setTimeout(() => {
            const randomDate = new Date();
            randomDate.setFullYear(randomDate.getFullYear() + 1);
            
            const renewalDate = document.getElementById('renewalDate');
            const purchaseDate = document.getElementById('purchaseDate');
            
            if (renewalDate) renewalDate.value = randomDate.toISOString().split('T')[0];
            if (purchaseDate) purchaseDate.value = new Date().toISOString().split('T')[0];
            
            if (status) {
                status.textContent = 'Domain information auto-filled!';
                status.style.color = 'var(--success)';
            }
            
            setTimeout(() => {
                if (status) status.style.display = 'none';
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
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center">No domains found</td></tr>';
            return;
        }

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

    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'es' : 'en';
        this.applyTranslations();
        this.showToast(`Language changed to ${this.currentLang === 'en' ? 'English' : 'Spanish'}`);
    }

    applyTranslations() {
        const elements = document.querySelectorAll('[data-translate-key]');
        elements.forEach(el => {
            const key = el.dataset.translateKey;
            const translation = this.translations[this.currentLang]?.[key];
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
        return this.translations[this.currentLang]?.[key] || key;
    }

    togglePasswordVisibility(e) {
        const icon = e.currentTarget;
        const input = icon.previousElementSibling;
        
        if (input && input.type === 'password') {
            input.type = 'text';
            icon.setAttribute('data-lucide', 'eye-off');
        } else if (input) {
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
        if (this.domains.length === 0) {
            this.showToast('No domains to export', 'warning');
            return;
        }

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
        const username = document.getElementById('settingUsername')?.value;
        if (username) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) userNameEl.textContent = username;
            
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar && !userAvatar.style.backgroundImage) {
                userAvatar.textContent = username.split(' ').map(n => n[0]).join('').toUpperCase();
            }
            
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
        localStorage.setItem('accentColor', color);
        this.showToast('Accent color updated');
    }

    handleProfilePictureUpload(e) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const userAvatar = document.getElementById('userAvatar');
                const settingsAvatar = document.getElementById('settingsAvatarPreview');
                
                if (userAvatar) {
                    userAvatar.style.backgroundImage = `url('${e.target.result}')`;
                    userAvatar.style.backgroundSize = 'cover';
                    userAvatar.textContent = '';
                }
                
                if (settingsAvatar) {
                    settingsAvatar.style.backgroundImage = `url('${e.target.result}')`;
                    settingsAvatar.style.backgroundSize = 'cover';
                    settingsAvatar.textContent = '';
                }
                
                this.showToast('Profile picture updated');
            };
            reader.readAsDataURL(file);
        }
    }

    removeProfilePicture() {
        const userAvatar = document.getElementById('userAvatar');
        const settingsAvatar = document.getElementById('settingsAvatarPreview');
        const userName = document.getElementById('userName')?.textContent || 'JD';
        
        if (userAvatar) {
            userAvatar.style.backgroundImage = '';
            userAvatar.textContent = userName.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        
        if (settingsAvatar) {
            settingsAvatar.style.backgroundImage = '';
            settingsAvatar.textContent = userName.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        
        this.showToast('Profile picture removed');
    }

    checkAuth() {
        // Only set default user if not authenticated with Firebase
        if (!this.currentUser) {
            const userNameEl = document.getElementById('userName');
            const userAvatar = document.getElementById('userAvatar');
            
            if (userNameEl && !userNameEl.textContent) {
                userNameEl.textContent = 'Guest User';
            }
            if (userAvatar && !userAvatar.style.backgroundImage && !userAvatar.textContent) {
                userAvatar.textContent = 'GU';
            }
        }
    }

    renderExpensesChart() {
        const canvas = document.getElementById('expensesChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.expensesChart) {
            this.expensesChart.destroy();
        }

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = new Array(12).fill(0);

        this.domains.forEach(domain => {
            const month = new Date(domain.renewalDate).getMonth();
            data[month] += parseFloat(domain.price) || 0;
        });

        this.expensesChart = new Chart(ctx, {
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
                }
            }
        });
    }

    renderProvidersChart() {
        const canvas = document.getElementById('providersChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.providersChart) {
            this.providersChart.destroy();
        }

        const providerCounts = {};
        this.domains.forEach(domain => {
            providerCounts[domain.provider] = (providerCounts[domain.provider] || 0) + 1;
        });

        if (Object.keys(providerCounts).length === 0) {
            providerCounts['No Data'] = 1;
        }

        this.providersChart = new Chart(ctx, {
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
                        '#ffe033',
                        '#ffcc80'
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
            
            // Update active swatch
            document.querySelectorAll('.color-swatch').forEach(swatch => {
                if (swatch.dataset.color === savedColor) {
                    swatch.classList.add('active');
                }
            });
        }
    }

    initializeUI() {
        // Hide loading indicator
        this.hideLoading();

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
            return { class: 'expired', text: 'Expired' };
        } else if (daysLeft <= 30) {
            return { class: 'warning', text: 'Expiring Soon' };
        } else {
            return { class: 'active', text: 'Active' };
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

// Also hide loading if DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    }, 100);
}
