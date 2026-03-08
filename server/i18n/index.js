const SUPPORTED_LOCALES = ['en', 'no'];
const DEFAULT_LOCALE = 'en';

const translations = {
  en: {
    errors: {
      generic: 'An unexpected error occurred.'
    }
  },
  no: {
    errors: {
      generic: 'En uventet feil oppstod.'
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

export function t(locale, key, params = {}) {
  const dict = translations[locale] || translations[DEFAULT_LOCALE];
  const value = key.split('.').reduce((cursor, part) => cursor?.[part], dict);

  if (typeof value !== 'string') {
    return key;
  }

  return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}

export { SUPPORTED_LOCALES, DEFAULT_LOCALE, normalizeLocale };
