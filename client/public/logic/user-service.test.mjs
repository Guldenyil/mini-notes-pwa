import { describe, expect, it, vi } from 'vitest';

const apiRequestMock = vi.fn();

vi.mock('../data/api-client.mjs', () => ({
  apiRequest: (...args) => apiRequestMock(...args)
}));

import { createUser, deleteUser, editUser } from './user-service.mjs';

describe('user-service', () => {
  it('normalizes createUser payload before API call', async () => {
    apiRequestMock.mockResolvedValue({ ok: true });

    await createUser({
      username: '  NewUser  ',
      email: '  USER@Example.COM ',
      password: 12345678,
      tosAccepted: 1
    });

    expect(apiRequestMock).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: {
        username: 'NewUser',
        email: 'user@example.com',
        password: '12345678',
        tosAccepted: true
      }
    });
  });

  it('sends only non-empty profile fields for editUser', async () => {
    apiRequestMock.mockResolvedValue({ ok: true });

    await editUser('token-1', {
      username: ' Updated ',
      email: ' ',
      extra: 'ignored'
    });

    expect(apiRequestMock).toHaveBeenCalledWith('/account/profile', {
      method: 'PATCH',
      token: 'token-1',
      body: {
        username: 'Updated'
      }
    });
  });

  it('maps deleteNotes to boolean in deleteUser', async () => {
    apiRequestMock.mockResolvedValue({ ok: true });

    await deleteUser('token-2', 0);

    expect(apiRequestMock).toHaveBeenCalledWith('/account', {
      method: 'DELETE',
      token: 'token-2',
      body: {
        deleteNotes: false
      }
    });
  });
});
