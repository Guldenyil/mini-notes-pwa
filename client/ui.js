/**
 * UI Manager
 * Handles UI rendering and state management
 */

import { authManager } from './auth.js';

class UIManager {
  constructor() {
    this.currentView = 'loading';
    this.init();
  }

  init() {
    // Check authentication state and show appropriate view
    if (authManager.isAuthenticated()) {
      this.showMainApp();
    } else {
      this.showLoginView();
    }

    // Handle hash navigation
    window.addEventListener('hashchange', () => this.handleNavigation());
    this.handleNavigation();
  }

  handleNavigation() {
    const hash = window.location.hash.slice(1);
    
    if (!authManager.isAuthenticated() && hash !== 'register') {
      window.location.hash = '#login';
      return;
    }

    switch (hash) {
      case 'register':
        this.showRegisterView();
        break;
      case 'login':
        this.showLoginView();
        break;
      case 'settings':
        this.showSettingsView();
        break;
      default:
        if (authManager.isAuthenticated()) {
          this.showMainApp();
        } else {
          this.showLoginView();
        }
    }
  }

  /**
   * Show registration view
   */
  showRegisterView() {
    this.currentView = 'register';
    document.body.innerHTML = `
      <div class="auth-container">
        <div class="auth-card">
          <h1>Create Account</h1>
          <p class="subtitle">Join Mini Notes to start taking notes</p>

          <form id="registerForm" class="auth-form">
            <div class="form-group">
              <label for="username">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                required 
                minlength="3" 
                maxlength="30"
                pattern="[a-zA-Z0-9_-]+"
                placeholder="johndoe"
              >
              <small>3-30 characters, letters, numbers, - and _ only</small>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="you@example.com"
              >
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                minlength="8"
                placeholder="At least 8 characters"
              >
              <small>Minimum 8 characters</small>
            </div>

            <div class="form-group">
              <label for="passwordConfirm">Confirm Password</label>
              <input 
                type="password" 
                id="passwordConfirm" 
                name="passwordConfirm" 
                required 
                placeholder="Repeat your password"
              >
            </div>

            <div class="tos-section">
              <h3>Terms of Service & Privacy Policy</h3>
              <div class="tos-content">
                <div class="tos-links">
                  <a href="#" id="viewTos">View Terms of Service</a> | 
                  <a href="#" id="viewPrivacy">View Privacy Policy</a>
                </div>
                <div class="tos-summary">
                  <strong>Quick Summary:</strong>
                  <ul>
                    <li>✓ You own your data completely</li>
                    <li>✓ We collect minimal personal info (email, username)</li>
                    <li>✓ We never sell or share your data</li>
                    <li>✓ You can export or delete your data anytime</li>
                    <li>✓ GDPR compliant with full user rights</li>
                  </ul>
                </div>
              </div>
              
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    id="tosAccepted" 
                    name="tosAccepted" 
                    required
                  >
                  <span>
                    I have read and agree to the 
                    <a href="#" class="tos-link" id="tosLink">Terms of Service</a> and 
                    <a href="#" class="tos-link" id="privacyLink">Privacy Policy</a>
                  </span>
                </label>
              </div>
            </div>

            <div id="registerError" class="error-message" style="display: none;"></div>

            <button type="submit" class="btn btn-primary">Create Account</button>
          </form>

          <div class="auth-footer">
            Already have an account? <a href="#login">Login</a>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
    document.getElementById('viewTos').addEventListener('click', (e) => {
      e.preventDefault();
      this.showDocument('tos');
    });
    document.getElementById('viewPrivacy').addEventListener('click', (e) => {
      e.preventDefault();
      this.showDocument('privacy');
    });
    document.getElementById('tosLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.showDocument('tos');
    });
    document.getElementById('privacyLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.showDocument('privacy');
    });
  }

  /**
   * Show login view
   */
  showLoginView() {
    this.currentView = 'login';
    document.body.innerHTML = `
      <div class="auth-container">
        <div class="auth-card">
          <h1>Welcome Back</h1>
          <p class="subtitle">Login to Mini Notes</p>

          <form id="loginForm" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="you@example.com"
              >
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                placeholder="Your password"
              >
            </div>

            <div id="loginError" class="error-message" style="display: none;"></div>

            <button type="submit" class="btn btn-primary">Login</button>
          </form>

          <div class="auth-footer">
            Don't have an account? <a href="#register">Register</a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
  }

  /**
   * Show main application
   */
  showMainApp() {
    this.currentView = 'main';
    const user = authManager.user;

    document.body.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1>Mini Notes</h1>
          <div class="user-info">
            <span>👤 ${user.username}</span>
            <button id="settingsBtn" class="btn btn-secondary">Settings</button>
            <button id="logoutBtn" class="btn btn-secondary">Logout</button>
          </div>
        </header>

        <main class="app-main">
          <div class="container">
            <h2>Your Notes</h2>
            <p>Note-taking interface coming soon...</p>
            <p>Authentication system is now working! 🎉</p>
            
            <div class="placeholder-info">
              <h3>What's Working:</h3>
              <ul>
                <li>✓ User registration with ToS consent</li>
                <li>✓ User login with JWT tokens</li>
                <li>✓ Protected API endpoints</li>
                <li>✓ Account settings & deletion</li>
                <li>✓ Data export functionality</li>
                <li>✓ GDPR compliance</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    `;

    document.getElementById('settingsBtn').addEventListener('click', () => {
      window.location.hash = '#settings';
    });
    document.getElementById('logoutBtn').addEventListener('click', () => {
      authManager.logout();
    });
  }

  /**
   * Show settings/account management view
   */
  showSettingsView() {
    this.currentView = 'settings';
    const user = authManager.user;

    document.body.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1>Account Settings</h1>
          <div class="user-info">
            <button id="backBtn" class="btn btn-secondary">← Back to Notes</button>
            <button id="logoutBtn" class="btn btn-secondary">Logout</button>
          </div>
        </header>

        <main class="app-main">
          <div class="container settings-container">
            
            <section class="settings-section">
              <h2>Account Information</h2>
              <div class="info-item">
                <strong>Username:</strong> ${user.username}
              </div>
              <div class="info-item">
                <strong>Email:</strong> ${user.email}
              </div>
              <div class="info-item">
                <strong>Member Since:</strong> ${new Date(user.createdAt).toLocaleDateString()}
              </div>
            </section>

            <section class="settings-section">
              <h2>Data Management</h2>
              <button id="exportBtn" class="btn btn-primary">Export All Data</button>
              <p class="help-text">Download all your notes and account data in JSON format</p>
            </section>

            <section class="settings-section">
              <h2>Legal Documents</h2>
              <button id="viewTosBtn" class="btn btn-secondary">View Terms of Service</button>
              <button id="viewPrivacyBtn" class="btn btn-secondary">View Privacy Policy</button>
              <p class="help-text">ToS Version: ${user.tosVersionAccepted || '1.0.0'}</p>
            </section>

            <section class="settings-section danger-zone">
              <h2>⚠️ Danger Zone</h2>
              <p class="warning-text">
                Account deletion is permanent and cannot be undone. 
                All your data will be permanently deleted within 48 hours.
              </p>
              <button id="deleteAccountBtn" class="btn btn-danger">Delete Account</button>
            </section>

          </div>
        </main>
      </div>
    `;

    // Event listeners
    document.getElementById('backBtn').addEventListener('click', () => {
      window.location.hash = '';
    });
    document.getElementById('logoutBtn').addEventListener('click', () => {
      authManager.logout();
    });
    document.getElementById('exportBtn').addEventListener('click', () => {
      this.handleExportData();
    });
    document.getElementById('viewTosBtn').addEventListener('click', () => {
      this.showDocument('tos');
    });
    document.getElementById('viewPrivacyBtn').addEventListener('click', () => {
      this.showDocument('privacy');
    });
    document.getElementById('deleteAccountBtn').addEventListener('click', () => {
      this.handleDeleteAccount();
    });
  }

  /**
   * Handle registration form submission
   */
  async handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const passwordConfirm = formData.get('passwordConfirm');
    const tosAccepted = formData.get('tosAccepted') === 'on';

    // Validate passwords match
    if (password !== passwordConfirm) {
      this.showError('registerError', 'Passwords do not match');
      return;
    }

    // Validate ToS acceptance
    if (!tosAccepted) {
      this.showError('registerError', 'You must accept the Terms of Service');
      return;
    }

    // Disable form during submission
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    // Attempt registration
    const result = await authManager.register(username, email, password, tosAccepted);

    if (result.success) {
      // Registration successful, redirect to main app
      window.location.hash = '';
    } else {
      // Show error
      this.showError('registerError', result.error);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  }

  /**
   * Handle login form submission
   */
  async handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const email = formData.get('email');
    const password = formData.get('password');

    // Disable form during submission
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    // Attempt login
    const result = await authManager.login(email, password);

    if (result.success) {
      // Login successful, redirect to main app
      window.location.hash = '';
    } else {
      // Show error
      this.showError('loginError', result.error);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  }

  /**
   * Handle data export
   */
  async handleExportData() {
    const result = await authManager.exportData();
    if (result.success) {
      alert('Data exported successfully! Check your downloads.');
    } else {
      alert('Export failed: ' + result.error);
    }
  }

  /**
   * Handle account deletion
   */
  async handleDeleteAccount() {
    const confirmed = confirm(
      '⚠️ WARNING: This will permanently delete your account!\n\n' +
      'This action cannot be undone. All your data will be permanently deleted within 48 hours.\n\n' +
      'Do you want to delete your notes or keep them as anonymous contributions?'
    );

    if (!confirmed) return;

    const deleteNotes = confirm(
      'Delete your notes?\n\n' +
      'YES = Delete all notes\n' +
      'NO = Keep notes as anonymous contributions'
    );

    const finalConfirm = confirm(
      '🚨 FINAL CONFIRMATION 🚨\n\n' +
      'This is your last chance to cancel.\n\n' +
      `You chose to: ${deleteNotes ? 'DELETE all notes' : 'KEEP notes anonymously'}\n\n` +
      'Are you absolutely sure you want to delete your account?'
    );

    if (!finalConfirm) return;

    const result = await authManager.deleteAccount(deleteNotes);

    if (result.success) {
      alert('Account deleted successfully. You will be redirected to the login page.');
      window.location.hash = '#login';
    } else {
      alert('Account deletion failed: ' + result.error);
    }
  }

  /**
   * Show error message
   */
  showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      setTimeout(() => {
        errorEl.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Show ToS or Privacy Policy in modal
   */
  showDocument(type) {
    const title = type === 'tos' ? 'Terms of Service' : 'Privacy Policy';
    const content = type === 'tos' ? this.getTosContent() : this.getPrivacyContent();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary close-modal">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    const closeModal = () => {
      document.body.removeChild(modal);
    };
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  getTosContent() {
    return `
      <p><strong>Effective Date:</strong> January 30, 2026 | <strong>Version:</strong> 1.0.0</p>
      
      <h3>Quick Summary</h3>
      <ul>
        <li><strong>You own your data:</strong> All notes and content remain your property</li>
        <li><strong>Service license:</strong> You grant us permission to store and display your notes back to you</li>
        <li><strong>Acceptable use:</strong> Use for personal note-taking only</li>
        <li><strong>Account deletion:</strong> You can delete your account anytime</li>
      </ul>

      <p>For the complete Terms of Service, see the TERMS_OF_SERVICE.md file in the repository.</p>
    `;
  }

  getPrivacyContent() {
    return `
      <p><strong>Effective Date:</strong> January 30, 2026 | <strong>Version:</strong> 1.0.0</p>
      
      <h3>What We Collect</h3>
      <ul>
        <li>Email address (for account management)</li>
        <li>Username (for display)</li>
        <li>Password hash (never plain text)</li>
        <li>Your notes and their metadata</li>
      </ul>

      <h3>What We DON'T Collect</h3>
      <ul>
        <li>Real names, phone numbers, or addresses</li>
        <li>Payment information</li>
        <li>Tracking cookies or analytics</li>
        <li>IP addresses or device fingerprints</li>
      </ul>

      <h3>Your GDPR Rights</h3>
      <ul>
        <li><strong>Right to Access:</strong> Export all your data</li>
        <li><strong>Right to Rectification:</strong> Update your info</li>
        <li><strong>Right to Erasure:</strong> Delete your account</li>
        <li><strong>Right to Data Portability:</strong> Download your data</li>
      </ul>

      <p>For the complete Privacy Policy, see the PRIVACY_POLICY.md file in the repository.</p>
    `;
  }
}

// Initialize UI
export const uiManager = new UIManager();
