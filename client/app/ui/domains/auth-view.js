import { authManager } from '../../auth/auth-manager.js';
import { getCurrentLocale, t } from '../../i18n/index.js';

export function renderRegisterView(uiManager) {
  uiManager.currentView = 'register';
  uiManager.ensureCSS();
  const currentLocale = getCurrentLocale();

  document.body.innerHTML = `
    <main class="auth-container" role="main">
      <div class="auth-card">
        <div class="language-switcher" aria-label="Language switcher">
          <button type="button" class="language-btn ${currentLocale === 'en' ? 'active' : ''}" data-locale="en" aria-label="${t('localeSwitcher.switchToEnglish')}">🇬🇧 EN</button>
          <button type="button" class="language-btn ${currentLocale === 'no' ? 'active' : ''}" data-locale="no" aria-label="${t('localeSwitcher.switchToNorwegian')}">🇳🇴 NO</button>
        </div>
        <h1>${t('auth.ui.registerTitle')}</h1>
        <p class="subtitle">${t('auth.ui.registerSubtitle')}</p>

        <form id="registerForm" class="auth-form" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label for="username">${t('auth.ui.usernameLabel')}</label>
              <input
                type="text"
                id="username"
                name="username"
                required
                minlength="3"
                maxlength="30"
                pattern="[a-zA-Z0-9_\\-]+"
                autocomplete="username"
                placeholder="johndoe"
              >
              <small>${t('auth.ui.usernameHint')}</small>
            </div>

            <div class="form-group">
              <label for="email">${t('auth.ui.emailLabel')}</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autocomplete="email"
                placeholder="you@example.com"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="password">${t('auth.ui.passwordLabel')}</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minlength="8"
                autocomplete="new-password"
                placeholder="${t('auth.ui.passwordPlaceholder')}"
              >
              <small>${t('auth.ui.passwordHint')}</small>
            </div>

            <div class="form-group">
              <label for="passwordConfirm">${t('auth.ui.passwordConfirmLabel')}</label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                required
                autocomplete="new-password"
                placeholder="${t('auth.ui.passwordConfirmPlaceholder')}"
              >
            </div>
          </div>

          <div class="tos-section">
            <div class="tos-summary">
              <ul>
                <li>${t('auth.ui.tosBullet1')}</li>
                <li>${t('auth.ui.tosBullet2')}</li>
                <li>${t('auth.ui.tosBullet3')}</li>
                <li>${t('auth.ui.tosBullet4')}</li>
                <li>${t('auth.ui.tosBullet5')}</li>
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
                  ${t('auth.ui.tosAgreementPrefix')}
                  <a href="#" class="tos-link" id="tosLink" aria-label="${t('auth.ui.termsLink')}">${t('auth.ui.termsLink')}</a> and
                  <a href="#" class="tos-link" id="privacyLink" aria-label="${t('auth.ui.privacyLink')}">${t('auth.ui.privacyLink')}</a>
                </span>
              </label>
            </div>
          </div>

          <div id="registerError" class="error-message" role="alert" aria-live="assertive" style="display: none;"></div>

          <button type="submit" class="btn btn-primary">${t('auth.actions.createAccount')}</button>
        </form>

        <div class="auth-footer">
          ${t('auth.ui.alreadyHaveAccount')} <a href="#login">${t('auth.ui.loginLink')}</a>
        </div>
      </div>
    </main>
  `;

  document.getElementById('registerForm').addEventListener('submit', (e) => uiManager.handleRegister(e));
  document.getElementById('tosLink').addEventListener('click', (e) => {
    e.preventDefault();
    uiManager.showDocument('tos');
  });
  document.getElementById('privacyLink').addEventListener('click', (e) => {
    e.preventDefault();
    uiManager.showDocument('privacy');
  });
}

export function renderLoginView(uiManager) {
  uiManager.currentView = 'login';
  uiManager.ensureCSS();
  const currentLocale = getCurrentLocale();

  document.body.innerHTML = `
    <main class="auth-container" role="main">
      <div class="auth-card">
        <div class="language-switcher" aria-label="Language switcher">
          <button type="button" class="language-btn ${currentLocale === 'en' ? 'active' : ''}" data-locale="en" aria-label="${t('localeSwitcher.switchToEnglish')}">🇬🇧 EN</button>
          <button type="button" class="language-btn ${currentLocale === 'no' ? 'active' : ''}" data-locale="no" aria-label="${t('localeSwitcher.switchToNorwegian')}">🇳🇴 NO</button>
        </div>
        <h1>${t('auth.ui.welcomeBack')}</h1>
        <p class="subtitle">${t('auth.ui.loginSubtitle')}</p>

        <form id="loginForm" class="auth-form" novalidate>
          <div class="form-group">
            <label for="email">${t('auth.ui.emailLabel')}</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
            >
          </div>

          <div class="form-group">
            <label for="password">${t('auth.ui.passwordLabel')}</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autocomplete="current-password"
              placeholder="${t('auth.ui.passwordLabel')}"
            >
          </div>

          <div id="loginError" class="error-message" role="alert" aria-live="assertive" style="display: none;"></div>

          <button type="submit" class="btn btn-primary">${t('auth.actions.login')}</button>
        </form>

        <div class="auth-footer">
          ${t('auth.ui.noAccountYet')} <a href="#register">${t('auth.ui.registerLink')}</a>
        </div>
      </div>
    </main>
  `;

  document.getElementById('loginForm').addEventListener('submit', (e) => uiManager.handleLogin(e));
}

export async function handleRegister(uiManager, event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const username = formData.get('username');
  const email = formData.get('email');
  const password = formData.get('password');
  const passwordConfirm = formData.get('passwordConfirm');
  const tosAccepted = formData.get('tosAccepted') === 'on';

  if (password !== passwordConfirm) {
    uiManager.showError('registerError', t('auth.errors.passwordsMismatch'));
    return;
  }

  if (!tosAccepted) {
    uiManager.showError('registerError', t('auth.errors.tosRequired'));
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = t('auth.actions.creatingAccount');

  const result = await authManager.register(username, email, password, tosAccepted);

  if (result.success) {
    window.location.hash = '';
    return;
  }

  uiManager.showError('registerError', result.error);
  submitBtn.disabled = false;
  submitBtn.textContent = t('auth.actions.createAccount');
}

export async function handleLogin(uiManager, event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const email = formData.get('email');
  const password = formData.get('password');

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = t('auth.actions.loggingIn');

  const result = await authManager.login(email, password);

  if (result.success) {
    window.location.hash = '';
    return;
  }

  uiManager.showError('loginError', result.error);
  submitBtn.disabled = false;
  submitBtn.textContent = t('auth.actions.login');
}
