import { authManager } from '../../auth/auth-manager.js';

export function renderSettingsView(uiManager) {
  uiManager.currentView = 'settings';
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

  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.hash = '';
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    authManager.logout();
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    handleExportData();
  });

  document.getElementById('viewTosBtn').addEventListener('click', () => {
    uiManager.showDocument('tos');
  });

  document.getElementById('viewPrivacyBtn').addEventListener('click', () => {
    uiManager.showDocument('privacy');
  });

  document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    handleDeleteAccount();
  });
}

export async function handleExportData() {
  const result = await authManager.exportData();
  if (result.success) {
    alert('Data exported successfully! Check your downloads.');
    return;
  }

  alert(`Export failed: ${result.error}`);
}

export async function handleDeleteAccount() {
  const confirmed = confirm(
    '⚠️ WARNING: This will permanently delete your account!\n\n' +
    'This action cannot be undone. All your data will be permanently deleted within 48 hours.\n\n' +
    'Do you want to delete your notes or keep them as anonymous contributions?'
  );

  if (!confirmed) {
    return;
  }

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

  if (!finalConfirm) {
    return;
  }

  const result = await authManager.deleteAccount(deleteNotes);

  if (result.success) {
    alert('Account deleted successfully. You will be redirected to the login page.');
    window.location.hash = '#login';
    return;
  }

  alert(`Account deletion failed: ${result.error}`);
}
