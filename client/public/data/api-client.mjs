const API_BASE = '/api';

/**
 * Centralized API request function.
 * NOTE: This is the only place where fetch is used.
 */
export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    token
  } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' && payload?.message
      ? payload.message
      : `HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}
