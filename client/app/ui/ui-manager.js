/**
 * UI Manager
 * Orchestrates domain-specific UI modules
 */

import {
  handleLogin,
  handleRegister,
  renderLoginView,
  renderRegisterView
} from './domains/auth-view.js';
import {
  renderMainApp,
  saveNote,
  showNoteModal,
  showNoteViewModal,
  hideNoteModal,
  hideNoteViewModal,
  loadNotes,
  searchNotes,
  deleteNote,
  displayNotes
} from './domains/notes-view.js';
import {
  renderSettingsView,
  handleDeleteAccount,
  handleExportData
} from './domains/settings-view.js';
import { getPrivacyContent, getTosContent } from './domains/legal-content.js';
import { authManager } from '../auth/auth-manager.js';

class UIManager {
  constructor() {
    this.currentView = 'loading';
    this.notes = [];
    this.editingNoteId = null;
    this.init();
  }

  ensureCSS() {
    if (!document.querySelector('link[href="/styles.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/styles.css';
      document.head.appendChild(link);
    }
  }

  init() {
    if (authManager.isAuthenticated()) {
      this.showMainApp();
    } else {
      this.showLoginView();
    }

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

  showRegisterView() {
    renderRegisterView(this);
  }

  showLoginView() {
    renderLoginView(this);
  }

  async showMainApp() {
    await renderMainApp(this);
  }

  showSettingsView() {
    renderSettingsView(this);
  }

  async handleRegister(event) {
    await handleRegister(this, event);
  }

  async handleLogin(event) {
    await handleLogin(this, event);
  }

  async handleExportData() {
    await handleExportData();
  }

  async handleDeleteAccount() {
    await handleDeleteAccount();
  }

  showNoteModal(note = null) {
    showNoteModal(this, note);
  }

  hideNoteModal() {
    hideNoteModal(this);
  }

  async saveNote() {
    await saveNote(this);
  }

  async loadNotes() {
    await loadNotes(this);
  }

  displayNotes(notes) {
    displayNotes(this, notes);
  }

  showNoteViewModal(note) {
    showNoteViewModal(this, note);
  }

  hideNoteViewModal() {
    hideNoteViewModal();
  }

  async deleteNote(noteId) {
    await deleteNote(this, noteId);
  }

  searchNotes(query) {
    searchNotes(query);
  }

  showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (!errorEl) {
      return;
    }

    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 5000);
  }

  showDocument(type) {
    const title = type === 'tos' ? 'Terms of Service' : 'Privacy Policy';
    const content = type === 'tos' ? getTosContent() : getPrivacyContent();

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

    const closeModal = () => {
      document.body.removeChild(modal);
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }
 }

 export const uiManager = new UIManager();
 window.uiManager = uiManager;
