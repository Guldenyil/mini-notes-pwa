import { authManager } from '../../auth/auth-manager.js';

export async function renderMainApp(uiManager) {
  uiManager.currentView = 'main';
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

  document.getElementById('settingsBtn').addEventListener('click', () => {
    window.location.hash = '#settings';
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
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
    title.textContent = 'Edit Note';
    noteTitle.value = note.title;
    noteContent.value = note.content;
    noteCategory.value = note.category || '';
    notePinned.checked = note.isPinned;
    uiManager.editingNoteId = note.id;
  } else {
    title.textContent = 'New Note';
    noteTitle.value = '';
    noteContent.value = '';
    noteCategory.value = '';
    notePinned.checked = false;
    uiManager.editingNoteId = null;
  }

  modal.style.display = 'flex';
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
    alert('Please fill in both title and content');
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
    alert(`Failed to save note: ${error.message}`);
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
    document.getElementById('notesGrid').innerHTML = `<p class="error">Failed to load notes: ${error.message}</p>`;
  }
}

export function displayNotes(uiManager, notes) {
  const grid = document.getElementById('notesGrid');

  if (notes.length === 0) {
    grid.innerHTML = '<p class="no-notes">No notes yet. Click "+ New Note" to create one!</p>';
    return;
  }

  grid.innerHTML = notes.map((note) => `
    <div class="note-card ${note.isPinned ? 'pinned' : ''}" data-id="${note.id}">
      ${note.isPinned ? '<div class="pin-indicator">📌</div>' : ''}
      <h3 class="note-title">${escapeHtml(note.title)}</h3>
      <p class="note-content">${escapeHtml(note.content)}</p>
      ${note.category ? `<span class="note-category">${escapeHtml(note.category)}</span>` : ''}
      <div class="note-footer">
        <span class="note-date">${new Date(note.createdAt).toLocaleDateString()}</span>
        <div class="note-actions">
          <button class="btn-icon edit-note" data-id="${note.id}" title="Edit">✏️</button>
          <button class="btn-icon delete-note" data-id="${note.id}" title="Delete">🗑️</button>
        </div>
      </div>
    </div>
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
    <div class="modal-content note-view-modal">
      <div class="modal-header">
        <h2>${escapeHtml(note.title)}</h2>
        <button class="btn-icon close-modal">✕</button>
      </div>
      <div class="modal-body">
        <div class="note-view-content">${escapeHtml(note.content)}</div>
        ${note.category ? `<div class="note-view-meta"><strong>Category:</strong> ${escapeHtml(note.category)}</div>` : ''}
        <div class="note-view-meta">
          <strong>Created:</strong> ${new Date(note.createdAt).toLocaleString()}
        </div>
        ${note.updatedAt !== note.createdAt ? `
          <div class="note-view-meta">
            <strong>Updated:</strong> ${new Date(note.updatedAt).toLocaleString()}
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary edit-from-view" data-id="${note.id}">Edit Note</button>
        <button class="btn btn-secondary close-view-modal">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

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
  if (!confirm('Are you sure you want to delete this note?')) {
    return;
  }

  try {
    await authManager.makeAuthenticatedRequest(`/api/notes/${noteId}`, {
      method: 'DELETE'
    });
    await loadNotes(uiManager);
  } catch (error) {
    alert(`Failed to delete note: ${error.message}`);
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
