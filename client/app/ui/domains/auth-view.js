import { authManager } from '../../auth/auth-manager.js';

export function renderRegisterView(uiManager) {
  uiManager.currentView = 'register';
  uiManager.ensureCSS();

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
    uiManager.showError('registerError', 'Passwords do not match');
    return;
  }

  if (!tosAccepted) {
    uiManager.showError('registerError', 'You must accept the Terms of Service');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';

  const result = await authManager.register(username, email, password, tosAccepted);

  if (result.success) {
    window.location.hash = '';
    return;
  }

  uiManager.showError('registerError', result.error);
  submitBtn.disabled = false;
  submitBtn.textContent = 'Create Account';
}

export async function handleLogin(uiManager, event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const email = formData.get('email');
  const password = formData.get('password');

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  const result = await authManager.login(email, password);

  if (result.success) {
    window.location.hash = '';
    return;
  }

  uiManager.showError('loginError', result.error);
  submitBtn.disabled = false;
  submitBtn.textContent = 'Login';
}
