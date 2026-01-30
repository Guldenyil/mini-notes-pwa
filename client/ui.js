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
            <div class="form-row">
              <div class="form-group">
                <label for="username">Username</label>
                <input 
                  type="text" 
                  id="username" 
                  name="username" 
                  required 
                  minlength="3" 
                  maxlength="30"
                  pattern="[a-zA-Z0-9_\\-]+"
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
            </div>

            <div class="form-row">
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
            </div>

            <div class="tos-section">
              <div class="tos-summary">
                <ul>
                  <li>You own your data completely</li>
                  <li>We collect minimal personal info (email, username)</li>
                  <li>We never sell or share your data</li>
                  <li>You can export or delete your data anytime</li>
                  <li>GDPR compliant with full user rights</li>
                </ul>
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
  async showMainApp() {
    this.currentView = 'main';
    const user = authManager.user;

    document.body.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="header-left">
            <h1>📝 Mini Notes</h1>
          </div>
          <div class="header-right">
            <span class="user-badge">👤 ${user.username}</span>
            <button id="settingsBtn" class="btn btn-secondary">⚙️ Settings</button>
            <button id="logoutBtn" class="btn btn-secondary">🚪 Logout</button>
          </div>
        </header>

        <main class="app-main">
          <div class="notes-container">
            <div class="notes-header">
              <h2>Your Notes</h2>
              <button id="addNoteBtn" class="btn btn-primary">+ New Note</button>
            </div>

            <div class="notes-filters">
              <input type="text" id="searchInput" placeholder="🔍 Search notes..." class="search-input">
            </div>

            <div id="notesGrid" class="notes-grid">
              <div class="loading">Loading notes...</div>
            </div>
          </div>
        </main>

        <!-- Note Modal -->
        <div id="noteModal" class="modal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="modalTitle">New Note</h3>
              <button id="closeModal" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
              <input type="text" id="noteTitle" placeholder="Note title" class="note-input">
              <textarea id="noteContent" placeholder="Write your note here..." class="note-textarea"></textarea>
              <div class="note-options">
                <input type="text" id="noteCategory" placeholder="Category (optional)" class="note-input-small">
                <label class="pin-label">
                  <input type="checkbox" id="notePinned"> 📌 Pin this note
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button id="cancelNote" class="btn btn-secondary">Cancel</button>
              <button id="saveNote" class="btn btn-primary">Save Note</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById('settingsBtn').addEventListener('click', () => {
      window.location.hash = '#settings';
    });
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
      authManager.logout();
    });

    document.getElementById('addNoteBtn').addEventListener('click', () => {
      this.showNoteModal();
    });

    document.getElementById('closeModal').addEventListener('click', () => {
      this.hideNoteModal();
    });

    document.getElementById('cancelNote').addEventListener('click', () => {
      this.hideNoteModal();
    });

    document.getElementById('saveNote').addEventListener('click', () => {
      this.saveNote();
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.searchNotes(e.target.value);
    });

    // Load notes
    await this.loadNotes();
  }

  showNoteModal(note = null) {
    const modal = document.getElementById('noteModal');
    const title = document.getElementById('modalTitle');
    const noteTitle = document.getElementById('noteTitle');
    const noteContent = document.getElementById('noteContent');
    const noteCategory = document.getElementById('noteCategory');
    const notePinned = document.getElementById('notePinned');

    if (note) {
      title.textContent = 'Edit Note';
      noteTitle.value = note.title;
      noteContent.value = note.content;
      noteCategory.value = note.category || '';
      notePinned.checked = note.isPinned;
      this.editingNoteId = note.id;
    } else {
      title.textContent = 'New Note';
      noteTitle.value = '';
      noteContent.value = '';
      noteCategory.value = '';
      notePinned.checked = false;
      this.editingNoteId = null;
    }

    modal.style.display = 'flex';
  }

  hideNoteModal() {
    document.getElementById('noteModal').style.display = 'none';
    this.editingNoteId = null;
  }

  async saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const category = document.getElementById('noteCategory').value.trim();
    const isPinned = document.getElementById('notePinned').checked;

    if (!title || !content) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      const data = { title, content, category, isPinned };
      
      if (this.editingNoteId) {
        await authManager.makeAuthenticatedRequest(`/api/notes/${this.editingNoteId}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } else {
        await authManager.makeAuthenticatedRequest('/api/notes', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }

      this.hideNoteModal();
      await this.loadNotes();
    } catch (error) {
      alert('Failed to save note: ' + error.message);
    }
  }

  async loadNotes() {
    try {
      const response = await authManager.makeAuthenticatedRequest('/api/notes');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        this.displayNotes(data.data);
      } else {
        throw new Error(data.error || 'Failed to load notes');
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      document.getElementById('notesGrid').innerHTML = `<p class="error">Failed to load notes: ${error.message}</p>`;
    }
  }

  displayNotes(notes) {
    const grid = document.getElementById('notesGrid');
    
    if (notes.length === 0) {
      grid.innerHTML = '<p class="no-notes">No notes yet. Click "+ New Note" to create one!</p>';
      return;
    }

    grid.innerHTML = notes.map(note => `
      <div class="note-card ${note.isPinned ? 'pinned' : ''}" data-id="${note.id}">
        ${note.isPinned ? '<div class="pin-indicator">📌</div>' : ''}
        <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
        <p class="note-content">${this.escapeHtml(note.content)}</p>
        ${note.category ? `<span class="note-category">${this.escapeHtml(note.category)}</span>` : ''}
        <div class="note-footer">
          <span class="note-date">${new Date(note.createdAt).toLocaleDateString()}</span>
          <div class="note-actions">
            <button class="btn-icon edit-note" data-id="${note.id}">✏️</button>
            <button class="btn-icon delete-note" data-id="${note.id}">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.edit-note').forEach(btn => {
      btn.addEventListener('click', () => {
        const note = notes.find(n => n.id === parseInt(btn.dataset.id));
        this.showNoteModal(note);
      });
    });

    document.querySelectorAll('.delete-note').forEach(btn => {
      btn.addEventListener('click', () => {
        this.deleteNote(parseInt(btn.dataset.id));
      });
    });
  }

  async deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await authManager.makeAuthenticatedRequest(`/api/notes/${noteId}`, {
        method: 'DELETE'
      });
      await this.loadNotes();
    } catch (error) {
      alert('Failed to delete note: ' + error.message);
    }
  }

  searchNotes(query) {
    const cards = document.querySelectorAll('.note-card');
    const searchLower = query.toLowerCase();

    cards.forEach(card => {
      const title = card.querySelector('.note-title').textContent.toLowerCase();
      const content = card.querySelector('.note-content').textContent.toLowerCase();
      
      if (title.includes(searchLower) || content.includes(searchLower)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
