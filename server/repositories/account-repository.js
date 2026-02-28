import { query } from '../db/connection.js';

export async function deleteNotesByUser(client, userId) {
  return client.query('DELETE FROM notes WHERE user_id = $1', [userId]);
}

export async function anonymizeNotesByUser(client, userId) {
  return client.query('UPDATE notes SET user_id = NULL WHERE user_id = $1', [userId]);
}

export async function softDeleteUserById(client, userId) {
  return client.query('UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
}

export async function hardDeleteUserById(client, userId) {
  return client.query('DELETE FROM users WHERE id = $1', [userId]);
}

export async function findUserExportById(userId) {
  return query(
    `SELECT id, username, email, tos_version_accepted, tos_accepted_at, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [userId]
  );
}

export async function findNotesByUser(userId) {
  return query(
    `SELECT id, title, content, category, color, is_pinned, created_at, updated_at
     FROM notes
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
}

export async function findAccountStatsByUser(userId) {
  return query(
    `SELECT
      COUNT(*) as total_notes,
      COUNT(CASE WHEN is_pinned THEN 1 END) as pinned_notes,
      COUNT(DISTINCT category) as unique_categories,
      MIN(created_at) as oldest_note,
      MAX(created_at) as newest_note
     FROM notes
     WHERE user_id = $1`,
    [userId]
  );
}

export async function findUsernameConflict(username, userId) {
  return query(
    'SELECT id FROM users WHERE username = $1 AND id != $2',
    [username, userId]
  );
}

export async function findEmailConflict(email, userId) {
  return query(
    'SELECT id FROM users WHERE email = $1 AND id != $2',
    [email, userId]
  );
}

export async function updateProfileById(userId, updates, values) {
  return query(
    `UPDATE users
     SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length}
     RETURNING id, username, email, updated_at`,
    values
  );
}