
  // ---------- Firebase Imports & Initialization ----------
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
  import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
  } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
  import {
    getFirestore,
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
    getDocs
  } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

  // 🔁 Replace with your Firebase config
  const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // ---------- Existing UI Constants & Helpers (unchanged) ----------
  // (Keep all your DOM element selections, translation data, chart config,
  // render functions, modal helpers, etc. exactly as they were.
  // I'll only show the modified parts below. The full code would be too long,
  // but you'll keep everything except the data persistence logic.)

  // Example: your existing arrays (now filled by Firestore)
  let domains = [];
  let providers = [];
  let notifications = [];      // generated locally, not stored
  let settings = {
    username: 'User',
    theme: 'pink',
    customColor: null,
    profilePicture: null,
    language: 'en'
  };

  // ---------- Auth UI Elements (created dynamically) ----------
  const createAuthUI = () => {
    const authContainer = document.createElement('div');
    authContainer.id = 'authContainer';
    authContainer.innerHTML = `
      <div class="auth-box">
        <h2>Domain Vault Login</h2>
        <input type="email" id="authEmail" placeholder="Email" />
        <input type="password" id="authPassword" placeholder="Password" />
        <button id="authLoginBtn">Login</button>
        <button id="authSignupBtn">Sign Up</button>
        <p id="authError" style="color: red;"></p>
      </div>
    `;
    document.body.prepend(authContainer);

    document.getElementById('authLoginBtn').addEventListener('click', () => {
      const email = document.getElementById('authEmail').value;
      const pass = document.getElementById('authPassword').value;
      signInWithEmailAndPassword(auth, email, pass).catch(err => {
        document.getElementById('authError').textContent = err.message;
      });
    });

    document.getElementById('authSignupBtn').addEventListener('click', () => {
      const email = document.getElementById('authEmail').value;
      const pass = document.getElementById('authPassword').value;
      createUserWithEmailAndPassword(auth, email, pass).catch(err => {
        document.getElementById('authError').textContent = err.message;
      });
    });
  };

  const showAuthUI = () => {
    let authContainer = document.getElementById('authContainer');
    if (!authContainer) createAuthUI();
    authContainer.style.display = 'flex';
    document.getElementById('app').style.display = 'none'; // hide main app
  };

  const hideAuthUI = () => {
    const authContainer = document.getElementById('authContainer');
    if (authContainer) authContainer.style.display = 'none';
    document.getElementById('app').style.display = 'block';
  };

  // ---------- Firestore Listeners ----------
  let unsubscribeDomains, unsubscribeProviders, unsubscribeSettings;

  const setupFirestoreListeners = (userId) => {
    // Domains
    const domainsQuery = query(collection(db, 'domains'), where('userId', '==', userId));
    unsubscribeDomains = onSnapshot(domainsQuery, (snapshot) => {
      domains = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderDomains();          // your existing render function
      updateDashboard();        // recalc charts, etc.
      updateNotifications();    // regenerate notifications
      lucide.createIcons();
    });

    // Providers
    const providersQuery = query(collection(db, 'providers'), where('userId', '==', userId));
    unsubscribeProviders = onSnapshot(providersQuery, (snapshot) => {
      providers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderProviders();
    });

    // Settings (single document per user, using userId as doc id)
    const settingsRef = doc(db, 'settings', userId);
    unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        settings = { ...settings, ...docSnap.data() };
      } else {
        // create default settings document
        setDoc(settingsRef, settings);
      }
      applySettings();   // your existing function
      setLanguage(settings.language);
    });
  };

  // ---------- Firestore Write Operations ----------
  // (Call these from your event handlers instead of modifying arrays + saveData)

  const addDomainToFirestore = async (domainData) => {
    const userId = auth.currentUser.uid;
    await addDoc(collection(db, 'domains'), { ...domainData, userId });
  };

  const updateDomainInFirestore = async (domainId, updatedData) => {
    const userId = auth.currentUser.uid;
    const ref = doc(db, 'domains', domainId);
    await updateDoc(ref, updatedData);
  };

  const deleteDomainFromFirestore = async (domainId) => {
    const ref = doc(db, 'domains', domainId);
    await deleteDoc(ref);
  };

  // Similar for providers
  const addProviderToFirestore = async (providerData) => {
    const userId = auth.currentUser.uid;
    await addDoc(collection(db, 'providers'), { ...providerData, userId });
  };

  const updateProviderInFirestore = async (providerId, updatedData) => {
    const ref = doc(db, 'providers', providerId);
    await updateDoc(ref, updatedData);
  };

  const deleteProviderFromFirestore = async (providerId) => {
    const ref = doc(db, 'providers', providerId);
    await deleteDoc(ref);
  };

  // Settings update (merge)
  const updateSettingsInFirestore = async (newSettings) => {
    const userId = auth.currentUser.uid;
    const ref = doc(db, 'settings', userId);
    await setDoc(ref, newSettings, { merge: true });
  };

  // ---------- One‑time Migration from localStorage ----------
  const migrateLocalStorage = async (userId) => {
    const localDomains = JSON.parse(localStorage.getItem('domains')) || [];
    const localProviders = JSON.parse(localStorage.getItem('providers')) || [];
    const localSettings = JSON.parse(localStorage.getItem('settings')) || {};

    // Check if any data already exists in Firestore for this user
    const domainsSnap = await getDocs(query(collection(db, 'domains'), where('userId', '==', userId)));
    if (domainsSnap.empty && localDomains.length > 0) {
      // Upload domains
      for (const d of localDomains) {
        await addDoc(collection(db, 'domains'), { ...d, userId });
      }
    }

    const providersSnap = await getDocs(query(collection(db, 'providers'), where('userId', '==', userId)));
    if (providersSnap.empty && localProviders.length > 0) {
      for (const p of localProviders) {
        await addDoc(collection(db, 'providers'), { ...p, userId });
      }
    }

    const settingsRef = doc(db, 'settings', userId);
    const settingsSnap = await getDocs(settingsRef);
    if (!settingsSnap.exists() && Object.keys(localSettings).length > 0) {
      await setDoc(settingsRef, localSettings);
    }
  };

  // ---------- Auth State Observer ----------
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      hideAuthUI();
      // Set up listeners
      setupFirestoreListeners(user.uid);
      // Optionally migrate old data
      migrateLocalStorage(user.uid).catch(console.warn);
    } else {
      // User is signed out
      if (unsubscribeDomains) unsubscribeDomains();
      if (unsubscribeProviders) unsubscribeProviders();
      if (unsubscribeSettings) unsubscribeSettings();
      showAuthUI();
    }
  });

  // ---------- Logout (add button somewhere, e.g., in settings) ----------
  const addLogoutButton = () => {
    // You can place this button in your settings page or profile area
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.textContent = 'Logout';
    logoutBtn.addEventListener('click', () => signOut(auth));
    document.querySelector('#page-settings .card-body')?.appendChild(logoutBtn);
  };

  // ---------- Patch Event Handlers to Use Firestore ----------
  // We'll override the existing form submissions and action buttons.
  // Keep your original event listeners but replace the data modification parts.

  // Example: Domain form submit
  domainForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const providerName = getProviderName(); // your existing logic
    const domainData = {
      name: document.getElementById('domainName').value,
      provider: providerName,
      purchaseDate: document.getElementById('purchaseDate').value,
      renewalDate: document.getElementById('renewalDate').value,
      purchasePrice: parseFloat(document.getElementById('purchasePrice').value),
      renewalPrice: parseFloat(document.getElementById('renewalPrice').value),
      autoRenew: document.getElementById('domainAutoRenew').checked
    };

    const domainId = document.getElementById('domainId').value;
    if (domainId) {
      await updateDomainInFirestore(domainId, domainData);
    } else {
      await addDomainToFirestore(domainData);
    }
    closeModal(domainModal);
    showToast('Domain saved!');
  });

  // Example: Delete domain (already using action-btn click, modify that part)
  // In your body click handler, replace the deletion code with:
  if (actionBtn.title === 'Delete') {
    if (confirm('Are you sure?')) {
      deleteDomainFromFirestore(domainId);
      showToast('Domain deleted.');
    }
  }

  // Similarly for providers: use addProviderToFirestore, updateProviderInFirestore, deleteProviderFromFirestore

  // Example: Provider form submit
  providerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const providerData = {
      name: document.getElementById('providerName').value,
      url: document.getElementById('providerUrl').value,
      user: document.getElementById('providerUser').value,
      pass: document.getElementById('providerPass').value,
      uid: document.getElementById('providerUid').value
    };
    const providerId = document.getElementById('providerId').value;
    if (providerId) {
      await updateProviderInFirestore(providerId, providerData);
    } else {
      await addProviderToFirestore(providerData);
    }
    closeModal(providerModal);
    showToast('Provider saved!');
  });

  // Settings profile form: update Firestore instead of localStorage
  settingsProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    settings.username = document.getElementById('settingUsername').value;
    await updateSettingsInFirestore(settings);
    showToast('Profile updated!');
  });

  // Profile picture upload: same, but update settings and call updateSettingsInFirestore
  profilePicUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        settings.profilePicture = event.target.result;
        await updateSettingsInFirestore(settings);
        showToast('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  });

  // Custom color: update Firestore
  customColorPicker.addEventListener('change', async (e) => {
    settings.theme = 'custom';
    settings.customColor = e.target.value;
    await updateSettingsInFirestore(settings);
    updateDashboard();
    showToast('Custom color applied!');
  });

  // Language toggle: update Firestore
  translateBtn.addEventListener('click', async () => {
    settings.language = settings.language === 'en' ? 'es' : 'en';
    await updateSettingsInFirestore(settings);
    setLanguage(settings.language);
  });

  // ---------- Remove all localStorage calls ----------
  // Delete getInitialData() and saveData() entirely.
  // Remove any localStorage.getItem/setItem lines.

  // ---------- Initialize ----------
  document.addEventListener('DOMContentLoaded', () => {
    // Create auth UI if not exists
    createAuthUI();

    // Add logout button (you can style and place it appropriately)
    addLogoutButton();

    // Your existing initialization steps (chart defaults, etc.) remain,
    // but do NOT call getInitialData().
    // The listeners will populate data once user logs in.

    // Initially hide main app (it will be shown after login)
    document.getElementById('app').style.display = 'none';
  });

