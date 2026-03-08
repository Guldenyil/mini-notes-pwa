import { getClient } from '../db/connection.js';
import {
  anonymizeNotesByUser,
  deleteNotesByUser,
  findAccountStatsByUser,
  findEmailConflict,
  findNotesByUser,
  findUserExportById,
  findUsernameConflict,
  hardDeleteUserById,
  softDeleteUserById,
  updateProfileById
} from '../repositories/account-repository.js';

function createServiceError(status, error, messageKey) {
  const serviceError = new Error(messageKey);
  serviceError.status = status;
  serviceError.error = error;
  serviceError.messageKey = messageKey;
  return serviceError;
}

export async function deleteAccount(userId, deleteNotes = true) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    if (deleteNotes) {
      await deleteNotesByUser(client, userId);
    } else {
      await anonymizeNotesByUser(client, userId);
    }

    await softDeleteUserById(client, userId);
    await hardDeleteUserById(client, userId);

    await client.query('COMMIT');

    return {
      message: 'Account deleted successfully',
      deletedNotes: deleteNotes,
      anonymizedNotes: !deleteNotes
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw createServiceError(
      500,
      'Account deletion failed',
      'account.errors.deletionFailed'
    );
  } finally {
    client.release();
  }
}

export async function exportAccountData(userId) {
  const userResult = await findUserExportById(userId);

  if (userResult.rows.length === 0) {
    throw createServiceError(404, 'User not found', 'account.errors.userNotFound');
  }

  const user = userResult.rows[0];
  const notesResult = await findNotesByUser(userId);

  return {
    exportDate: new Date().toISOString(),
    exportVersion: '1.0.0',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      tosVersionAccepted: user.tos_version_accepted,
      tosAcceptedAt: user.tos_accepted_at,
      accountCreated: user.created_at,
      lastUpdated: user.updated_at
    },
    notes: notesResult.rows,
    statistics: {
      totalNotes: notesResult.rows.length,
      pinnedNotes: notesResult.rows.filter((note) => note.is_pinned).length,
      categoryCounts: notesResult.rows.reduce((acc, note) => {
        const key = note.category || 'uncategorized';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    }
  };
}

export async function getAccountStats(userId) {
  const result = await findAccountStatsByUser(userId);
  const stats = result.rows[0];

  return {
    totalNotes: parseInt(stats.total_notes, 10),
    pinnedNotes: parseInt(stats.pinned_notes, 10),
    uniqueCategories: parseInt(stats.unique_categories, 10),
    oldestNote: stats.oldest_note,
    newestNote: stats.newest_note
  };
}

export async function updateAccountProfile(userId, payload) {
  const { username, email } = payload;

  if (!username && !email) {
    throw createServiceError(
      400,
      'No fields to update',
      'account.errors.noFieldsToUpdate'
    );
  }

  const updates = [];
  const values = [];
  let paramCount = 0;

  if (username) {
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
      throw createServiceError(
        400,
        'Invalid username',
        'account.errors.invalidUsername'
      );
    }

    const usernameCheck = await findUsernameConflict(username, userId);
    if (usernameCheck.rows.length > 0) {
      throw createServiceError(409, 'Username taken', 'account.errors.usernameTaken');
    }

    paramCount += 1;
    updates.push(`username = $${paramCount}`);
    values.push(username);
  }

  if (email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createServiceError(400, 'Invalid email', 'account.errors.invalidEmail');
    }

    const normalizedEmail = email.toLowerCase();
    const emailCheck = await findEmailConflict(normalizedEmail, userId);
    if (emailCheck.rows.length > 0) {
      throw createServiceError(409, 'Email taken', 'account.errors.emailTaken');
    }

    paramCount += 1;
    updates.push(`email = $${paramCount}`);
    values.push(normalizedEmail);
  }

  values.push(userId);

  const result = await updateProfileById(userId, updates, values);
  return result.rows[0];
}