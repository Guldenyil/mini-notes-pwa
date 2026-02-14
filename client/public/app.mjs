import { createUser } from './logic/user-service.mjs';

const appRoot = document.querySelector('#app');

if (appRoot) {
  appRoot.innerHTML = `
    <form id="createUserForm" class="form">
      <h2>Create User (Task 2)</h2>
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
    <pre id="result" class="status">Ready</pre>
  `;

  const form = document.querySelector('#createUserForm');
  const result = document.querySelector('#result');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      tosAccepted: formData.get('tosAccepted') === 'on'
    };

    result.textContent = 'Creating user...';

    try {
      const response = await createUser(payload);
      result.textContent = JSON.stringify(response, null, 2);
    } catch (error) {
      result.textContent = `Error: ${error.message}`;
    }
  });
}
