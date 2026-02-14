import { beforeEach, describe, expect, it, vi } from 'vitest';

const createUserMock = vi.fn();
const editUserMock = vi.fn();
const deleteUserMock = vi.fn();

vi.mock('../logic/user-service.mjs', () => ({
  createUser: (...args) => createUserMock(...args),
  editUser: (...args) => editUserMock(...args),
  deleteUser: (...args) => deleteUserMock(...args)
}));

async function setup() {
  document.body.innerHTML = '<user-manager></user-manager>';
  await import('./user-manager.component.mjs');
  return document.querySelector('user-manager');
}

describe('user-manager component', () => {
  beforeEach(() => {
    createUserMock.mockReset();
    editUserMock.mockReset();
    deleteUserMock.mockReset();
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('stores access token after create user', async () => {
    createUserMock.mockResolvedValue({
      accessToken: 'token-123',
      user: { id: 1 }
    });

    const component = await setup();

    component.querySelector('#createUserForm [name="username"]').value = 'tester';
    component.querySelector('#createUserForm [name="email"]').value = 'tester@example.com';
    component.querySelector('#createUserForm [name="password"]').value = 'Password123';

    component.querySelector('#createUserForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(createUserMock).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('mini-notes-scaffold-access-token')).toBe('token-123');
  });

  it('shows token-required message on edit without token', async () => {
    const component = await setup();

    component.querySelector('#editUserForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(component.querySelector('#result').textContent).toContain('Create user first to get access token');
    expect(editUserMock).not.toHaveBeenCalled();
  });

  it('clears stored token after delete account', async () => {
    localStorage.setItem('mini-notes-scaffold-access-token', 'token-123');
    deleteUserMock.mockResolvedValue({ message: 'Account deleted successfully' });

    const component = await setup();

    component.querySelector('#deleteUserForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(deleteUserMock).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('mini-notes-scaffold-access-token')).toBeNull();
  });

  it('uses persisted token for edit action after component setup', async () => {
    localStorage.setItem('mini-notes-scaffold-access-token', 'persisted-token');
    editUserMock.mockResolvedValue({ message: 'Profile updated' });

    const component = await setup();

    component.querySelector('#editUserForm [name="username"]').value = 'new-name';
    component.querySelector('#editUserForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(editUserMock).toHaveBeenCalledTimes(1);
    expect(editUserMock).toHaveBeenCalledWith('persisted-token', {
      username: 'new-name',
      email: ''
    });
  });

  it('shows successful edit response when persisted token is valid', async () => {
    localStorage.setItem('mini-notes-scaffold-access-token', 'persisted-token');
    editUserMock.mockResolvedValue({ message: 'Profile updated successfully' });

    const component = await setup();

    component.querySelector('#editUserForm [name="username"]').value = 'updated';
    component.querySelector('#editUserForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(component.querySelector('#result').textContent).toContain('Profile updated successfully');
  });

  it('renders create action API error message', async () => {
    createUserMock.mockRejectedValue(new Error('Create failed from API'));

    const component = await setup();

    component.querySelector('#createUserForm [name="username"]').value = 'tester';
    component.querySelector('#createUserForm [name="email"]').value = 'tester@example.com';
    component.querySelector('#createUserForm [name="password"]').value = 'Password123';

    component.querySelector('#createUserForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(component.querySelector('#result').textContent).toContain('Error: Create failed from API');
  });

  it('renders edit action API error message', async () => {
    localStorage.setItem('mini-notes-scaffold-access-token', 'token-123');
    editUserMock.mockRejectedValue(new Error('Edit failed from API'));

    const component = await setup();

    component.querySelector('#editUserForm [name="username"]').value = 'updated-name';
    component.querySelector('#editUserForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(component.querySelector('#result').textContent).toContain('Error: Edit failed from API');
  });

  it('renders delete action API error message', async () => {
    localStorage.setItem('mini-notes-scaffold-access-token', 'token-123');
    deleteUserMock.mockRejectedValue(new Error('Delete failed from API'));

    const component = await setup();

    component.querySelector('#deleteUserForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(component.querySelector('#result').textContent).toContain('Error: Delete failed from API');
  });
});
