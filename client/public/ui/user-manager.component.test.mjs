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
});
