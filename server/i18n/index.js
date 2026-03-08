const SUPPORTED_LOCALES = ['en', 'no'];
const DEFAULT_LOCALE = 'en';

const translations = {
  en: {
    errors: {
      generic: 'An unexpected error occurred.',
      corsNotAllowed: 'CORS origin not allowed'
    },
    auth: {
      errors: {
        registrationFailed: 'An error occurred during registration. Please try again.',
        loginFailed: 'An error occurred during login. Please try again.',
        tokenRefreshFailed: 'An error occurred while refreshing the token',
        getUserFailed: 'An error occurred while fetching user information',
        termsNotAccepted: 'You must accept the Terms of Service to create an account',
        emailExists: 'An account with this email already exists',
        usernameTaken: 'This username is already taken. Please choose another.',
        invalidCredentials: 'Email or password is incorrect',
        refreshTokenRequired: 'Please provide a refresh token',
        invalidRefreshToken: 'Refresh token is invalid or expired',
        userNotFound: 'User account no longer exists',
        authenticationRequired: 'Please provide a valid access token',
        invalidToken: 'Access token is invalid or expired'
      }
    },
    account: {
      errors: {
        deletionFailed: 'An error occurred while deleting your account. Please try again.',
        exportFailed: 'An error occurred while exporting your data. Please try again.',
        statsFailed: 'An error occurred while fetching statistics',
        updateFailed: 'An error occurred while updating your profile',
        userNotFound: 'User account not found',
        noFieldsToUpdate: 'Please provide username or email to update',
        invalidUsername: 'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens',
        invalidEmail: 'Please provide a valid email address',
        usernameTaken: 'This username is already taken',
        emailTaken: 'This email is already registered'
      }
    },
    notes: {
      errors: {
        listFailed: 'Failed to retrieve notes',
        readFailed: 'Failed to retrieve note',
        createFailed: 'Failed to create note',
        updateFailed: 'Failed to update note',
        deleteFailed: 'Failed to delete note',
        notFound: 'Note not found',
        noFieldsToUpdate: 'No fields to update'
      }
    }
  },
  no: {
    errors: {
      generic: 'En uventet feil oppstod.',
      corsNotAllowed: 'CORS-opprinnelse er ikke tillatt'
    },
    auth: {
      errors: {
        registrationFailed: 'Det oppstod en feil under registrering. Prøv igjen.',
        loginFailed: 'Det oppstod en feil under innlogging. Prøv igjen.',
        tokenRefreshFailed: 'Det oppstod en feil ved oppdatering av token',
        getUserFailed: 'Det oppstod en feil ved henting av brukerinformasjon',
        termsNotAccepted: 'Du må godta bruksvilkårene for å opprette en konto',
        emailExists: 'En konto med denne e-posten finnes allerede',
        usernameTaken: 'Dette brukernavnet er allerede tatt. Velg et annet.',
        invalidCredentials: 'E-post eller passord er feil',
        refreshTokenRequired: 'Vennligst oppgi et refresh-token',
        invalidRefreshToken: 'Refresh-token er ugyldig eller utløpt',
        userNotFound: 'Brukerkontoen finnes ikke lenger',
        authenticationRequired: 'Vennligst oppgi et gyldig tilgangstoken',
        invalidToken: 'Tilgangstoken er ugyldig eller utløpt'
      }
    },
    account: {
      errors: {
        deletionFailed: 'Det oppstod en feil under sletting av kontoen. Prøv igjen.',
        exportFailed: 'Det oppstod en feil under eksport av data. Prøv igjen.',
        statsFailed: 'Det oppstod en feil ved henting av statistikk',
        updateFailed: 'Det oppstod en feil ved oppdatering av profilen',
        userNotFound: 'Brukerkonto ble ikke funnet',
        noFieldsToUpdate: 'Vennligst oppgi brukernavn eller e-post som skal oppdateres',
        invalidUsername: 'Brukernavn må være 3-30 tegn og kan kun inneholde bokstaver, tall, understrek og bindestrek',
        invalidEmail: 'Vennligst oppgi en gyldig e-postadresse',
        usernameTaken: 'Dette brukernavnet er allerede i bruk',
        emailTaken: 'Denne e-posten er allerede registrert'
      }
    },
    notes: {
      errors: {
        listFailed: 'Kunne ikke hente notater',
        readFailed: 'Kunne ikke hente notatet',
        createFailed: 'Kunne ikke opprette notat',
        updateFailed: 'Kunne ikke oppdatere notat',
        deleteFailed: 'Kunne ikke slette notat',
        notFound: 'Notat ble ikke funnet',
        noFieldsToUpdate: 'Ingen felt å oppdatere'
      }
    }
  }
};

function normalizeLocale(input) {
  if (!input || typeof input !== 'string') {
    return DEFAULT_LOCALE;
  }

  const base = input.toLowerCase().split('-')[0];

  if (base === 'no' || base === 'nb' || base === 'nn') {
    return 'no';
  }

  if (base === 'en') {
    return 'en';
  }

  return DEFAULT_LOCALE;
}

function parseAcceptLanguage(acceptLanguageHeader) {
  if (!acceptLanguageHeader) {
    return [DEFAULT_LOCALE];
  }

  return acceptLanguageHeader
    .split(',')
    .map((entry) => entry.split(';')[0].trim())
    .filter(Boolean);
}

export function resolveRequestLocale(acceptLanguageHeader) {
  const candidates = parseAcceptLanguage(acceptLanguageHeader);

  for (const candidate of candidates) {
    const normalized = normalizeLocale(candidate);
    if (SUPPORTED_LOCALES.includes(normalized)) {
      return normalized;
    }
  }

  return DEFAULT_LOCALE;
}

function getTranslationValue(locale, key) {
  const dict = translations[locale];
  if (!dict) {
    return undefined;
  }

  return key.split('.').reduce((cursor, part) => cursor?.[part], dict);
}

export function t(locale, key, params = {}) {
  const normalizedLocale = normalizeLocale(locale);
  const value = getTranslationValue(normalizedLocale, key)
    ?? getTranslationValue(DEFAULT_LOCALE, key)
    ?? getTranslationValue(normalizedLocale, 'errors.generic')
    ?? getTranslationValue(DEFAULT_LOCALE, 'errors.generic');

  if (typeof value !== 'string') {
    return key;
  }

  return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}

export { SUPPORTED_LOCALES, DEFAULT_LOCALE, normalizeLocale };
