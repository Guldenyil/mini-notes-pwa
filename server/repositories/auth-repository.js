import { query } from '../db/connection.js';

export async function findActiveUserIdByEmail(email) {
  return query(
    'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );
}

export async function findActiveUserIdByUsername(username) {
  return query(
    'SELECT id FROM users WHERE username = $1 AND deleted_at IS NULL',
    [username]
  );
}

export async function createUserWithConsent({ username, email, passwordHash, tosVersion }) {
  return query(
    `INSERT INTO users (username, email, password_hash, tos_accepted_at, tos_version_accepted)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
     RETURNING id, username, email, tos_accepted_at, tos_version_accepted, created_at`,
    [username, email, passwordHash, tosVersion]
  );
}

export async function findActiveUserByEmailForLogin(email) {
  return query(
    `SELECT id, username, email, password_hash, tos_version_accepted, created_at
     FROM users
     WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );
}

export async function findActiveUserByIdBasic(userId) {
  return query(
    'SELECT id, username, email FROM users WHERE id = $1 AND deleted_at IS NULL',
    [userId]
  );
}

export async function findActiveUserByIdForMe(userId) {
  return query(
    `SELECT id, username, email, tos_version_accepted, created_at
     FROM users
     WHERE id = $1 AND deleted_at IS NULL`,
    [userId]
  );
}