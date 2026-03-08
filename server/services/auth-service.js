import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateTokens, JWT_SECRET, verifyToken } from '../middleware/auth.js';
import {
  createUserWithConsent,
  findActiveUserByEmailForLogin,
  findActiveUserByIdBasic,
  findActiveUserByIdForMe,
  findActiveUserIdByEmail,
  findActiveUserIdByUsername
} from '../repositories/auth-repository.js';

const CURRENT_TOS_VERSION = '1.0.0';

function createServiceError(status, error, messageKey) {
  const serviceError = new Error(messageKey);
  serviceError.status = status;
  serviceError.error = error;
  serviceError.messageKey = messageKey;
  return serviceError;
}

export async function registerUser(payload) {
  const { username, email, password, tosAccepted } = payload;

  if (!tosAccepted) {
    throw createServiceError(
      400,
      'Terms of Service not accepted',
      'auth.errors.termsNotAccepted'
    );
  }

  const normalizedEmail = email.toLowerCase();

  const emailCheck = await findActiveUserIdByEmail(normalizedEmail);
  if (emailCheck.rows.length > 0) {
    throw createServiceError(
      409,
      'Email already registered',
      'auth.errors.emailExists'
    );
  }

  const usernameCheck = await findActiveUserIdByUsername(username);
  if (usernameCheck.rows.length > 0) {
    throw createServiceError(
      409,
      'Username already taken',
      'auth.errors.usernameTaken'
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await createUserWithConsent({
    username,
    email: normalizedEmail,
    passwordHash,
    tosVersion: CURRENT_TOS_VERSION
  });

  const user = result.rows[0];
  const { accessToken, refreshToken } = generateTokens(user);

  return {
    message: 'Account created successfully',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      tosVersionAccepted: user.tos_version_accepted,
      createdAt: user.created_at
    },
    accessToken,
    refreshToken
  };
}

export async function loginUser(payload) {
  const { email, password } = payload;
  const normalizedEmail = email.toLowerCase();

  const result = await findActiveUserByEmailForLogin(normalizedEmail);
  if (result.rows.length === 0) {
    throw createServiceError(401, 'Invalid credentials', 'auth.errors.invalidCredentials');
  }

  const user = result.rows[0];
  const passwordValid = await bcrypt.compare(password, user.password_hash);

  if (!passwordValid) {
    throw createServiceError(401, 'Invalid credentials', 'auth.errors.invalidCredentials');
  }

  const needsTosUpdate = user.tos_version_accepted !== CURRENT_TOS_VERSION;
  const { accessToken, refreshToken } = generateTokens(user);

  return {
    message: 'Login successful',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      tosVersionAccepted: user.tos_version_accepted,
      needsTosUpdate,
      createdAt: user.created_at
    },
    accessToken,
    refreshToken
  };
}

export async function refreshUserToken(payload) {
  const { refreshToken } = payload;

  if (!refreshToken) {
    throw createServiceError(400, 'Refresh token required', 'auth.errors.refreshTokenRequired');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_SECRET);
  } catch (error) {
    throw createServiceError(401, 'Invalid refresh token', 'auth.errors.invalidRefreshToken');
  }

  const result = await findActiveUserByIdBasic(decoded.userId);
  if (result.rows.length === 0) {
    throw createServiceError(401, 'User not found', 'auth.errors.userNotFound');
  }

  const user = result.rows[0];
  const tokens = generateTokens(user);

  return {
    message: 'Token refreshed successfully',
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
}

export async function getCurrentUser(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createServiceError(401, 'Authentication required', 'auth.errors.authenticationRequired');
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    throw createServiceError(401, 'Invalid token', 'auth.errors.invalidToken');
  }

  const result = await findActiveUserByIdForMe(decoded.userId);
  if (result.rows.length === 0) {
    throw createServiceError(404, 'User not found', 'auth.errors.userNotFound');
  }

  const user = result.rows[0];
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      tosVersionAccepted: user.tos_version_accepted,
      needsTosUpdate: user.tos_version_accepted !== CURRENT_TOS_VERSION,
      createdAt: user.created_at
    }
  };
}