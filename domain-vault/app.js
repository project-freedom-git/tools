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

    // New method to hide loading indicator
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
            // Ensure loading is hidden even if there's an error
            this.hideLoading();
        }
    }

    async initializeFirebase() {
        try {
            // Import Firebase modules dynamically
            const { initializeApp } = await import('firebase/app');
            const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } = await import('firebase/auth');
            const { getFirestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } = await import('firebase/firestore');

            // Your Firebase configuration
            // REPLACE THESE VALUES WITH YOUR ACTUAL FIREBASE CONFIG
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
            // Fallback to local storage mode
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

        // Hide main content until authenticated
        document.querySelector('.main-content').style.opacity = '0.5';
        document.querySelector('.sidebar').style.opacity = '0.5';

        authContainer.style.display = 'flex';
        authContainer.innerHTML = this.renderAuthUI();
        
        // Hide logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }

        // Setup auth event listeners
        this.setupAuthListeners();
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
        document.querySelectorAll('.toggle-password').forEach(icon => {
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
            this.domains = domainsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Load providers
            const providersQuery = query(
                collection(this.db, 'providers'),
                where('userId', '==', this.currentUser.uid)
            );
            const providersSnapshot = await getDocs(providersQuery);
            this.providers = providersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // If no data, use defaults
            if (this.domains.length === 0) {
                this.domains = this.generateSampleDomains();
            }
            if (this.providers.length === 0) {
                this.providers = this.getDefaultProviders();
            }

            // Render UI
            this.renderSampleData();
            
            // Show main content
            document.querySelector('.main-content').style.opacity = '1';
            document.querySelector('.sidebar').style.opacity = '1';
            
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

                if (domainData.id) {
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

                if (providerData.id) {
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
            { id: '1', name: 'Namecheap', url: 'https://www.namecheap.com', username: '', password: '', userId: '' },
            { id: '2', name: 'GoDaddy', url: 'https://www.godaddy.com', username: '', password: '', userId: '' },
            { id: '3', name: 'Google Domains', url: 'https://domains.google', username: '', password: '', userId: '' },
            { id: '4', name: 'Cloudflare', url: 'https://www.cloudflare.com', username: '', password: '', userId: '' }
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
                id: i.toString(),
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
        document.querySelectorAll('.toggle-password').forEach(icon => {
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

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
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
                    <span class="status-badge status-${this.getStatusClass(domain.daysLeft)}">
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
                        <p><i data-luc
