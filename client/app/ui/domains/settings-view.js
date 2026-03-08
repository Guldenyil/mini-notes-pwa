import { authManager } from '../../auth/auth-manager.js';
import { t } from '../../i18n/index.js';

export function renderSettingsView(uiManager) {
  uiManager.currentView = 'settings';
  const user = authManager.user;

  document.body.innerHTML = `
    <div class="app-container">
      <header class="app-header">
        <h1>Account Settings</h1>
        <div class="user-info">
          <button id="backBtn" class="btn btn-secondary" aria-label="Back to notes">← Back to Notes</button>
          <button id="logoutBtn" class="btn btn-secondary" aria-label="Logout">Logout</button>
        </div>
      </header>

      <main class="app-main" role="main">
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
            <button id="exportBtn" class="btn btn-primary" aria-label="Export all account data">Export All Data</button>
            <p class="help-text">Download all your notes and account data in JSON format</p>
          </section>

          <section class="settings-section">
            <h2>Legal Documents</h2>
            <button id="viewTosBtn" class="btn btn-secondary" aria-label="View terms of service">View Terms of Service</button>
            <button id="viewPrivacyBtn" class="btn btn-secondary" aria-label="View privacy policy">View Privacy Policy</button>
            <p class="help-text">ToS Version: ${user.tosVersionAccepted || '1.0.0'}</p>
          </section>

          <section class="settings-section danger-zone">
            <h2>⚠️ Danger Zone</h2>
            <p class="warning-text">
              Account deletion is permanent and cannot be undone.
              All your data will be permanently deleted within 48 hours.
            </p>
            <button id="deleteAccountBtn" class="btn btn-danger" aria-label="Delete account permanently">Delete Account</button>
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
    alert(t('account.success.exportDone'));
    return;
  }

  alert(t('account.errors.exportFailed', { message: result.error }));
}

export async function handleDeleteAccount() {
  const confirmed = confirm(t('account.prompts.deleteWarning'));

  if (!confirmed) {
    return;
  }

  const deleteNotes = confirm(t('account.prompts.deleteNotesChoice'));

  const finalConfirm = confirm(t('account.prompts.finalDeleteConfirmation', {
    choice: deleteNotes
      ? t('account.prompts.deleteChoiceDelete')
      : t('account.prompts.deleteChoiceKeep')
  }));

  if (!finalConfirm) {
    return;
  }

  const result = await authManager.deleteAccount(deleteNotes);

  if (result.success) {
    alert(t('account.success.deletionDone'));
    window.location.hash = '#login';
    return;
  }

  alert(t('account.errors.deletionFailed', { message: result.error }));
}
