import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './api-client.mjs';

function createJsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (key) => (key === 'content-type' ? 'application/json' : null)
    },
    json: vi.fn().mockResolvedValue(payload),
    text: vi.fn().mockResolvedValue(JSON.stringify(payload))
  };
}

function createTextResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (key) => (key === 'content-type' ? 'text/plain' : null)
    },
    json: vi.fn().mockResolvedValue({ message: payload }),
    text: vi.fn().mockResolvedValue(payload)
  };
}

describe('apiRequest', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends JSON body and auth header when provided', async () => {
    global.fetch.mockResolvedValue(createJsonResponse({ success: true }));

    await apiRequest('/account/profile', {
      method: 'PATCH',
      token: 'abc123',
      body: { username: 'new-user' }
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/account/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer abc123'
      },
      body: JSON.stringify({ username: 'new-user' })
    });
  });

  it('returns plain text payload for text responses', async () => {
    global.fetch.mockResolvedValue(createTextResponse('ok-text'));

    const payload = await apiRequest('/health');

    expect(payload).toBe('ok-text');
  });

  it('throws API message when json error contains message', async () => {
    global.fetch.mockResolvedValue(createJsonResponse({ message: 'Custom error' }, 400));

    await expect(apiRequest('/auth/register', { method: 'POST', body: {} })).rejects.toThrow('Custom error');
  });

  it('throws HTTP status when text error has no json message', async () => {
    global.fetch.mockResolvedValue(createTextResponse('Bad request', 400));

    await expect(apiRequest('/auth/register', { method: 'POST', body: {} })).rejects.toThrow('HTTP 400');
  });
});
