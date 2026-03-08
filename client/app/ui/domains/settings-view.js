import { authManager } from '../../auth/auth-manager.js';
import { getCurrentLocale, t } from '../../i18n/index.js';

export function renderSettingsView(uiManager) {
  uiManager.currentView = 'settings';
  const user = authManager.user;
  const currentLocale = getCurrentLocale();

  document.body.innerHTML = `
    <div class="app-container">
      <header class="app-header">
        <h1>${t('account.ui.title')}</h1>
        <div class="user-info">
          <div class="language-switcher" aria-label="${t('localeSwitcher.label')}">
            <button type="button" class="language-btn ${currentLocale === 'en' ? 'active' : ''}" data-locale="en" aria-label="${t('localeSwitcher.switchToEnglish')}">🇬🇧 EN</button>
            <button type="button" class="language-btn ${currentLocale === 'no' ? 'active' : ''}" data-locale="no" aria-label="${t('localeSwitcher.switchToNorwegian')}">🇳🇴 NO</button>
          </div>
          <button id="backBtn" class="btn btn-secondary" aria-label="${t('account.ui.backToNotes')}">${t('account.ui.backToNotes')}</button>
          <button id="logoutBtn" class="btn btn-secondary" aria-label="${t('account.ui.logout')}">${t('account.ui.logout')}</button>
        </div>
      </header>

      <main class="app-main" role="main">
        <div class="container settings-container">

          <section class="settings-section">
            <h2>${t('account.ui.accountInformation')}</h2>
            <div class="info-item">
              <strong>${t('account.ui.username')}</strong> ${user.username}
            </div>
            <div class="info-item">
              <strong>${t('account.ui.email')}</strong> ${user.email}
            </div>
            <div class="info-item">
              <strong>${t('account.ui.memberSince')}</strong> ${new Date(user.createdAt).toLocaleDateString()}
            </div>
          </section>

          <section class="settings-section">
            <h2>${t('account.ui.dataManagement')}</h2>
            <button id="exportBtn" class="btn btn-primary" aria-label="${t('account.ui.exportAllData')}">${t('account.ui.exportAllData')}</button>
            <p class="help-text">${t('account.ui.exportHelp')}</p>
          </section>

          <section class="settings-section">
            <h2>${t('account.ui.legalDocuments')}</h2>
            <button id="viewTosBtn" class="btn btn-secondary" aria-label="${t('account.ui.viewTos')}">${t('account.ui.viewTos')}</button>
            <button id="viewPrivacyBtn" class="btn btn-secondary" aria-label="${t('account.ui.viewPrivacy')}">${t('account.ui.viewPrivacy')}</button>
            <p class="help-text">${t('account.ui.tosVersion')} ${user.tosVersionAccepted || '1.0.0'}</p>
          </section>

          <section class="settings-section danger-zone">
            <h2>${t('account.ui.dangerZone')}</h2>
            <p class="warning-text">
              ${t('account.ui.dangerText')}
            </p>
            <button id="deleteAccountBtn" class="btn btn-danger" aria-label="${t('account.ui.deleteAccount')}">${t('account.ui.deleteAccount')}</button>
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
