import { apiRequest } from '../data/api-client.mjs';

const mapRegisterInput = ({ username, email, password, tosAccepted = true }) => ({
  username: String(username || '').trim(),
  email: String(email || '').trim().toLowerCase(),
  password: String(password || ''),
  tosAccepted: Boolean(tosAccepted)
});

const mapProfileInput = ({ username, email }) => {
  const profile = {};

  if (typeof username === 'string' && username.trim()) {
    profile.username = username.trim();
  }

  if (typeof email === 'string' && email.trim()) {
    profile.email = email.trim().toLowerCase();
  }

  return profile;
};

export async function createUser(userInput) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: mapRegisterInput(userInput)
  });
}

export async function editUser(token, profileInput) {
  return apiRequest('/account/profile', {
    method: 'PATCH',
    token,
    body: mapProfileInput(profileInput)
  });
}

export async function deleteUser(token, deleteNotes = true) {
  return apiRequest('/account', {
    method: 'DELETE',
    token,
    body: { deleteNotes: Boolean(deleteNotes) }
  });
}
