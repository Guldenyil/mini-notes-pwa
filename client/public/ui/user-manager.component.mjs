import { createUser, editUser, deleteUser } from '../logic/user-service.mjs';

const ACCESS_TOKEN_STORAGE_KEY = 'mini-notes-scaffold-access-token';

class UserManager extends HTMLElement {
  constructor() {
    super();
    this.accessToken = '';
  }

  connectedCallback() {
    this.loadStoredToken();
    this.render();
    this.bindEvents();
  }

  loadStoredToken() {
    try {
      this.accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || '';
    } catch (error) {
      this.accessToken = '';
    }
  }

  persistToken(token) {
    this.accessToken = token || '';

    try {
      if (this.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, this.accessToken);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      }
    } catch (error) {
      // no-op for environments where storage is not available
    }
  }

  render() {
    this.innerHTML = `
      <section class="card">
        <h2>User Manager (Task 3)</h2>

        <form id="createUserForm" class="form" autocomplete="off">
          <h3>Create User</h3>
          <label>
            Username
            <input name="username" type="text" required minlength="3" />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" required minlength="8" />
          </label>
          <label class="checkbox-row">
            <input name="tosAccepted" type="checkbox" checked />
            ToS accepted
          </label>
          <button type="submit">Create User</button>
        </form>

        <form id="editUserForm" class="form" autocomplete="off">
          <h3>Edit User</h3>
          <label>
            Username (optional)
            <input name="username" type="text" minlength="3" />
          </label>
          <label>
            Email (optional)
            <input name="email" type="email" />
          </label>
          <button type="submit">Update Profile</button>
        </form>

        <form id="deleteUserForm" class="form" autocomplete="off">
          <h3>Delete User</h3>
          <label class="checkbox-row">
            <input name="deleteNotes" type="checkbox" checked />
            Delete notes permanently
          </label>
          <button type="submit" class="danger">Delete Account</button>
        </form>

        <pre id="result" class="status">Ready</pre>
      </section>
    `;
  }

  bindEvents() {
    const createForm = this.querySelector('#createUserForm');
    const editForm = this.querySelector('#editUserForm');
    const deleteForm = this.querySelector('#deleteUserForm');

    createForm?.addEventListener('submit', this.handleCreateUser.bind(this));
    editForm?.addEventListener('submit', this.handleEditUser.bind(this));
    deleteForm?.addEventListener('submit', this.handleDeleteUser.bind(this));
  }

  setStatus(message) {
    const result = this.querySelector('#result');
    if (result) {
      result.textContent = message;
    }
  }

  async handleCreateUser(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      tosAccepted: formData.get('tosAccepted') === 'on'
    };

    this.setStatus('Creating user...');

    try {
      const response = await createUser(payload);
      this.persistToken(response?.accessToken || '');
      this.setStatus(JSON.stringify(response, null, 2));
      form.reset();
    } catch (error) {
      this.setStatus(`Error: ${error.message}`);
    }
  }

  async handleEditUser(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!this.accessToken) {
      this.setStatus('Error: Create user first to get access token.');
      return;
    }

    const payload = {
      username: formData.get('username'),
      email: formData.get('email')
    };

    this.setStatus('Updating profile...');

    try {
      const response = await editUser(this.accessToken, payload);
      this.setStatus(JSON.stringify(response, null, 2));
      form.reset();
    } catch (error) {
      this.setStatus(`Error: ${error.message}`);
    }
  }

  async handleDeleteUser(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!this.accessToken) {
      this.setStatus('Error: Create user first to get access token.');
      return;
    }

    const deleteNotes = formData.get('deleteNotes') === 'on';

    this.setStatus('Deleting account...');

    try {
      const response = await deleteUser(this.accessToken, deleteNotes);
      this.persistToken('');
      this.setStatus(JSON.stringify(response, null, 2));
      form.reset();
    } catch (error) {
      this.setStatus(`Error: ${error.message}`);
    }
  }
}

customElements.define('user-manager', UserManager);
