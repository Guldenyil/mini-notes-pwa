const SUPPORTED_LOCALES = ['en', 'no'];
const DEFAULT_LOCALE = 'en';

const translations = {
  en: {
    locale: {
      name: 'English'
    },
    app: {
      loadingTitle: 'Loading...'
    },
    errors: {
      generic: 'Something went wrong. Please try again.'
    }
  },
  no: {
    locale: {
      name: 'Norsk'
    },
    app: {
      loadingTitle: 'Laster...'
    },
    errors: {
      generic: 'Noe gikk galt. Prøv igjen.'
    }
  }
};

let activeLocale = DEFAULT_LOCALE;

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

export function detectBrowserLocale() {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const candidates = [navigator.language, ...(navigator.languages || [])];

  for (const candidate of candidates) {
    const normalized = normalizeLocale(candidate);
    if (SUPPORTED_LOCALES.includes(normalized)) {
      return normalized;
    }
  }

  return DEFAULT_LOCALE;
}

export function initI18n() {
  activeLocale = detectBrowserLocale();

  if (typeof document !== 'undefined') {
    document.documentElement.lang = activeLocale;
  }

  return activeLocale;
}

export function getCurrentLocale() {
  return activeLocale;
}

export function t(key, params = {}, locale = activeLocale) {
  const dict = translations[locale] || translations[DEFAULT_LOCALE];
  const value = key.split('.').reduce((cursor, part) => cursor?.[part], dict);

  if (typeof value !== 'string') {
    return key;
  }

  return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}

export { SUPPORTED_LOCALES, DEFAULT_LOCALE, normalizeLocale };
