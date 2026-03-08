import { authManager } from '../../auth/auth-manager.js';
import { getCurrentLocale, t } from '../../i18n/index.js';

export async function renderMainApp(uiManager) {
  uiManager.currentView = 'main';
  const user = authManager.user;
  const currentLocale = getCurrentLocale();
  const displayUsername = formatDisplayUsername(user.username);

  document.body.innerHTML = `
    <div class="app-container">
      <header class="app-header">
        <div class="header-left">
          <h1>📝 Mini Notes</h1>
        </div>
        <div class="header-right">
          <div class="language-switcher" aria-label="${t('localeSwitcher.label')}">
            <button type="button" class="language-current" aria-label="${t('localeSwitcher.label')}" aria-haspopup="true" aria-expanded="false">
              <span class="language-current-flag">${currentLocale === 'no' ? '🇳🇴' : '🇬🇧'}</span>
              <span class="language-current-code">${currentLocale === 'no' ? 'NO' : 'EN'}</span>
              <span class="language-current-caret">▾</span>
            </button>
            <div class="language-menu" role="menu">
              <button type="button" class="language-option" data-locale="en" role="menuitem" aria-label="${t('localeSwitcher.switchToEnglish')}">🇬🇧 EN</button>
              <button type="button" class="language-option" data-locale="no" role="menuitem" aria-label="${t('localeSwitcher.switchToNorwegian')}">🇳🇴 NO</button>
            </div>
          </div>
          <div class="user-menu" id="userMenu">
            <button
              id="userMenuTrigger"
              type="button"
              class="user-badge user-menu-trigger"
              aria-haspopup="true"
              aria-expanded="false"
              aria-label="Open user menu"
            >👤 ${displayUsername}</button>
            <div class="user-menu-panel" id="userMenuPanel" role="menu">
              <button id="settingsBtn" type="button" class="user-menu-item" role="menuitem">⚙️ ${t('notes.ui.settings')}</button>
              <button id="logoutBtn" type="button" class="user-menu-item" role="menuitem">🚪 ${t('notes.ui.logout')}</button>
            </div>
          </div>
        </div>
      </header>

      <main class="app-main">
        <div class="notes-container">
          <div class="notes-header">
            <h2>${t('notes.ui.yourNotes')}</h2>
            <button id="addNoteBtn" class="btn btn-primary">${t('notes.ui.newNote')}</button>
          </div>

          <div class="notes-filters">
            <label for="searchInput" class="sr-only">${t('notes.ui.searchNotes')}</label>
            <input type="text" id="searchInput" placeholder="🔍 ${t('notes.ui.searchNotes')}" class="search-input" aria-label="${t('notes.ui.searchNotes')}">
          </div>

          <div id="notesGrid" class="notes-grid" aria-live="polite">
            <div class="loading">${t('notes.ui.loadingNotes')}</div>
          </div>
        </div>
      </main>

      <div id="noteModal" class="modal" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-content" tabindex="-1">
          <div class="modal-header">
            <h3 id="modalTitle">${t('notes.ui.newNoteTitle')}</h3>
            <button id="closeModal" class="close-btn" aria-label="${t('notes.ui.closeNoteEditor')}">&times;</button>
          </div>
          <div class="modal-body">
            <label for="noteTitle" class="sr-only">${t('notes.ui.noteTitle')}</label>
            <input type="text" id="noteTitle" placeholder="${t('notes.ui.noteTitlePlaceholder')}" class="note-input" aria-label="${t('notes.ui.noteTitle')}">
            <label for="noteContent" class="sr-only">${t('notes.ui.noteContent')}</label>
            <textarea id="noteContent" placeholder="${t('notes.ui.noteContentPlaceholder')}" class="note-textarea" aria-label="${t('notes.ui.noteContent')}"></textarea>
            <div class="note-options">
              <label for="noteCategory" class="sr-only">${t('notes.ui.noteCategory')}</label>
              <input type="text" id="noteCategory" placeholder="${t('notes.ui.noteCategoryPlaceholder')}" class="note-input-small" aria-label="${t('notes.ui.noteCategory')}">
              <label class="pin-label">
                <input type="checkbox" id="notePinned"> ${t('notes.ui.pinThisNote')}
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button id="cancelNote" class="btn btn-secondary">${t('notes.ui.cancel')}</button>
            <button id="saveNote" class="btn btn-primary">${t('notes.ui.saveNote')}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const userMenu = document.getElementById('userMenu');
  const userMenuTrigger = document.getElementById('userMenuTrigger');
  const userMenuPanel = document.getElementById('userMenuPanel');

  const closeUserMenu = () => {
    userMenu.classList.remove('open');
    userMenuTrigger.setAttribute('aria-expanded', 'false');
  };

  userMenuTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = userMenu.classList.contains('open');
    closeUserMenu();
    if (!isOpen) {
      userMenu.classList.add('open');
      userMenuTrigger.setAttribute('aria-expanded', 'true');
      userMenuPanel.querySelector('.user-menu-item')?.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('#userMenu')) {
      closeUserMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeUserMenu();
    }
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    closeUserMenu();
    window.location.hash = '#settings';
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    closeUserMenu();
    authManager.logout();
  });

  document.getElementById('addNoteBtn').addEventListener('click', () => {
    showNoteModal(uiManager);
  });

  document.getElementById('closeModal').addEventListener('click', () => {
    hideNoteModal(uiManager);
  });

  document.getElementById('cancelNote').addEventListener('click', () => {
    hideNoteModal(uiManager);
  });

  document.getElementById('saveNote').addEventListener('click', () => {
    saveNote(uiManager);
  });

  document.getElementById('searchInput').addEventListener('input', (event) => {
    searchNotes(event.target.value);
  });

  await loadNotes(uiManager);
}

export function showNoteModal(uiManager, note = null) {
  const modal = document.getElementById('noteModal');
  const title = document.getElementById('modalTitle');
  const noteTitle = document.getElementById('noteTitle');
  const noteContent = document.getElementById('noteContent');
  const noteCategory = document.getElementById('noteCategory');
  const notePinned = document.getElementById('notePinned');

  if (note) {
    title.textContent = t('notes.ui.editNote');
    noteTitle.value = note.title;
    noteContent.value = note.content;
    noteCategory.value = note.category || '';
    notePinned.checked = note.isPinned;
    uiManager.editingNoteId = note.id;
  } else {
    title.textContent = t('notes.ui.newNoteTitle');
    noteTitle.value = '';
    noteContent.value = '';
    noteCategory.value = '';
    notePinned.checked = false;
    uiManager.editingNoteId = null;
  }

  modal.style.display = 'flex';
  noteTitle.focus();
}

export function hideNoteModal(uiManager) {
  document.getElementById('noteModal').style.display = 'none';
  uiManager.editingNoteId = null;
}

export async function saveNote(uiManager) {
  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();
  const category = document.getElementById('noteCategory').value.trim();
  const isPinned = document.getElementById('notePinned').checked;

  if (!title || !content) {
    alert(t('notes.errors.fillTitleAndContent'));
    return;
  }

  try {
    const data = { title, content, category, isPinned };

    if (uiManager.editingNoteId) {
      await authManager.makeAuthenticatedRequest(`/api/notes/${uiManager.editingNoteId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } else {
      await authManager.makeAuthenticatedRequest('/api/notes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    hideNoteModal(uiManager);
    await loadNotes(uiManager);
  } catch (error) {
    alert(t('notes.errors.saveFailed', { message: error.message }));
  }
}

export async function loadNotes(uiManager) {
  try {
    const response = await authManager.makeAuthenticatedRequest('/api/notes');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to load notes');
    }

    uiManager.notes = data.data;
    displayNotes(uiManager, uiManager.notes);
  } catch (error) {
    console.error('Failed to load notes:', error);
    document.getElementById('notesGrid').innerHTML = `<p class="error">${t('notes.errors.loadFailed', { message: error.message })}</p>`;
  }
}

export function displayNotes(uiManager, notes) {
  const grid = document.getElementById('notesGrid');

  if (notes.length === 0) {
    grid.innerHTML = `<p class="no-notes">${t('notes.ui.noNotesYet')}</p>`;
    return;
  }

  grid.innerHTML = notes.map((note) => `
    <article class="note-card ${note.isPinned ? 'pinned' : ''}" data-id="${note.id}" tabindex="0" role="button" aria-label="${t('notes.ui.openNote')} ${escapeHtml(note.title)}">
      ${note.isPinned ? '<div class="pin-indicator">📌</div>' : ''}
      <h3 class="note-title">${escapeHtml(note.title)}</h3>
      <p class="note-content">${escapeHtml(note.content)}</p>
      ${note.category ? `<span class="note-category">${escapeHtml(note.category)}</span>` : ''}
      <div class="note-footer">
        <span class="note-date">${new Date(note.createdAt).toLocaleDateString()}</span>
        <div class="note-actions">
          <button class="btn-icon edit-note" data-id="${note.id}" title="${t('notes.ui.edit')}" aria-label="${t('notes.ui.edit')} ${escapeHtml(note.title)}">✏️</button>
          <button class="btn-icon delete-note" data-id="${note.id}" title="${t('notes.ui.delete')}" aria-label="${t('notes.ui.delete')} ${escapeHtml(note.title)}">🗑️</button>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.note-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.note-actions') || event.target.closest('.btn-icon')) {
        return;
      }

      const noteId = parseInt(card.dataset.id, 10);
      const note = uiManager.notes.find((item) => item.id === noteId);
      if (note) {
        showNoteViewModal(uiManager, note);
      }
    });
  });

  document.querySelectorAll('.note-card').forEach((card) => {
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      const noteId = parseInt(card.dataset.id, 10);
      const note = uiManager.notes.find((item) => item.id === noteId);

      if (note) {
        showNoteViewModal(uiManager, note);
      }
    });
  });

  document.querySelectorAll('.edit-note').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const note = uiManager.notes.find((item) => item.id === parseInt(button.dataset.id, 10));
      if (note) {
        showNoteModal(uiManager, note);
      }
    });
  });

  document.querySelectorAll('.delete-note').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteNote(uiManager, parseInt(button.dataset.id, 10));
    });
  });
}

export function showNoteViewModal(uiManager, note) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'noteViewOverlay';

  overlay.innerHTML = `
    <div class="modal-content note-view-modal" role="dialog" aria-modal="true" aria-label="${t('notes.ui.viewNote')}" tabindex="-1">
      <div class="modal-header">
        <h2>${escapeHtml(note.title)}</h2>
        <button class="btn-icon close-modal" aria-label="${t('notes.ui.closeNote')}">✕</button>
      </div>
      <div class="modal-body">
        <div class="note-view-content">${escapeHtml(note.content)}</div>
        ${note.category ? `<div class="note-view-meta"><strong>${t('notes.ui.category')}</strong> ${escapeHtml(note.category)}</div>` : ''}
        <div class="note-view-meta">
          <strong>${t('notes.ui.created')}</strong> ${new Date(note.createdAt).toLocaleString()}
        </div>
        ${note.updatedAt !== note.createdAt ? `
          <div class="note-view-meta">
            <strong>${t('notes.ui.updated')}</strong> ${new Date(note.updatedAt).toLocaleString()}
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary edit-from-view" data-id="${note.id}">${t('notes.ui.editNote')}</button>
        <button class="btn btn-secondary close-view-modal">${t('notes.ui.close')}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector('.note-view-modal').focus();

  overlay.querySelector('.close-modal').addEventListener('click', () => {
    hideNoteViewModal();
  });

  overlay.querySelector('.close-view-modal').addEventListener('click', () => {
    hideNoteViewModal();
  });

  overlay.querySelector('.edit-from-view').addEventListener('click', () => {
    hideNoteViewModal();
    showNoteModal(uiManager, note);
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      hideNoteViewModal();
    }
  });
}

export function hideNoteViewModal() {
  const overlay = document.getElementById('noteViewOverlay');
  if (overlay) {
    overlay.remove();
  }
}

export async function deleteNote(uiManager, noteId) {
  if (!confirm(t('notes.prompts.confirmDelete'))) {
    return;
  }

  try {
    await authManager.makeAuthenticatedRequest(`/api/notes/${noteId}`, {
      method: 'DELETE'
    });
    await loadNotes(uiManager);
  } catch (error) {
    alert(t('notes.errors.deleteFailed', { message: error.message }));
  }
}

export function searchNotes(query) {
  const cards = document.querySelectorAll('.note-card');
  const searchLower = query.toLowerCase();

  cards.forEach((card) => {
    const title = card.querySelector('.note-title').textContent.toLowerCase();
    const content = card.querySelector('.note-content').textContent.toLowerCase();

    if (title.includes(searchLower) || content.includes(searchLower)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDisplayUsername(username) {
  const safeUsername = String(username || '').trim();
  if (!safeUsername) {
    return '';
  }

  return safeUsername.charAt(0).toUpperCase() + safeUsername.slice(1);
}
