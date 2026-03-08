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
import { loadLegalDocument } from './domains/legal-content.js';
import { authManager } from '../auth/auth-manager.js';
import { getCurrentLocale, setLocale } from '../i18n/index.js';

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
    this.setupLanguageSwitcher();
  }

  showLoginView() {
    renderLoginView(this);
    this.setupLanguageSwitcher();
  }

  async showMainApp() {
    await renderMainApp(this);
    this.setupLanguageSwitcher();
  }

  showSettingsView() {
    renderSettingsView(this);
    this.setupLanguageSwitcher();
  }

  setupLanguageSwitcher() {
    const switchers = document.querySelectorAll('.language-switcher');
    if (!switchers.length) {
      return;
    }

    const localeMeta = {
      en: { flag: '🇬🇧', label: 'EN' },
      no: { flag: '🇳🇴', label: 'NO' }
    };

    if (this.languageSwitcherOutsideHandler) {
      document.removeEventListener('click', this.languageSwitcherOutsideHandler);
    }

    if (this.languageSwitcherEscapeHandler) {
      document.removeEventListener('keydown', this.languageSwitcherEscapeHandler);
    }

    const closeAllMenus = () => {
      document.querySelectorAll('.language-switcher.open').forEach((switcher) => {
        switcher.classList.remove('open');
        const trigger = switcher.querySelector('.language-current');
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    };

    this.languageSwitcherOutsideHandler = (event) => {
      if (!event.target.closest('.language-switcher')) {
        closeAllMenus();
      }
    };

    this.languageSwitcherEscapeHandler = (event) => {
      if (event.key === 'Escape') {
        closeAllMenus();
      }
    };

    document.addEventListener('click', this.languageSwitcherOutsideHandler);
    document.addEventListener('keydown', this.languageSwitcherEscapeHandler);

    const currentLocale = getCurrentLocale();

    switchers.forEach((switcher) => {
      const trigger = switcher.querySelector('.language-current');
      const options = switcher.querySelectorAll('.language-option[data-locale]');
      const meta = localeMeta[currentLocale] || localeMeta.en;

      if (!trigger || options.length === 0) {
        return;
      }

      const flagEl = trigger.querySelector('.language-current-flag');
      const codeEl = trigger.querySelector('.language-current-code');
      if (flagEl) {
        flagEl.textContent = meta.flag;
      }
      if (codeEl) {
        codeEl.textContent = meta.label;
      }

      trigger.setAttribute('aria-expanded', 'false');
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = switcher.classList.contains('open');
        closeAllMenus();
        if (!isOpen) {
          switcher.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });

      options.forEach((option) => {
        const locale = option.getAttribute('data-locale');
        option.classList.toggle('active', locale === currentLocale);

        option.addEventListener('click', () => {
          if (!locale || locale === getCurrentLocale()) {
            closeAllMenus();
            return;
          }

          setLocale(locale);
          closeAllMenus();
          this.handleNavigation();
        });
      });
    });
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

  async showDocument(type) {
    let documentData;

    try {
      documentData = await loadLegalDocument(type);
    } catch (error) {
      const targetErrorId = this.currentView === 'login' ? 'loginError' : 'registerError';
      const targetErrorElement = document.getElementById(targetErrorId);

      if (targetErrorElement) {
        this.showError(targetErrorId, error.message);
      } else {
        alert(error.message);
      }
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${documentData.title}</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${documentData.content}
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
