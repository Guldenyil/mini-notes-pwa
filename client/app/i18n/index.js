const SUPPORTED_LOCALES = ['en', 'no'];
const DEFAULT_LOCALE = 'en';

const translations = {
  en: {
    locale: {
      name: 'English'
    },
    app: {
      loadingTitle: 'Loading...',
      offlineNotice: 'You are offline. Some features may be limited until connection is restored.',
      onlineNotice: 'Connection restored. You are back online.'
    },
    auth: {
      errors: {
        passwordsMismatch: 'Passwords do not match',
        tosRequired: 'You must accept the Terms of Service',
        registrationFailed: 'Registration failed',
        loginFailed: 'Login failed',
        sessionExpired: 'Session expired. Please login again.',
        tokenRefreshFailed: 'Token refresh failed',
        getUserFailed: 'Failed to get user'
      },
      actions: {
        creatingAccount: 'Creating Account...',
        createAccount: 'Create Account',
        loggingIn: 'Logging in...',
        login: 'Login'
      }
    },
    notes: {
      errors: {
        fillTitleAndContent: 'Please fill in both title and content',
        saveFailed: 'Failed to save note: {message}',
        loadFailed: 'Failed to load notes: {message}',
        deleteFailed: 'Failed to delete note: {message}'
      },
      prompts: {
        confirmDelete: 'Are you sure you want to delete this note?'
      }
    },
    account: {
      errors: {
        exportFailed: 'Export failed: {message}',
        deletionFailed: 'Account deletion failed: {message}'
      },
      success: {
        exportDone: 'Data exported successfully! Check your downloads.',
        deletionDone: 'Account deleted successfully. You will be redirected to the login page.'
      },
      prompts: {
        deleteWarning: '⚠️ WARNING: This will permanently delete your account!\n\nThis action cannot be undone. All your data will be permanently deleted within 48 hours.\n\nDo you want to delete your notes or keep them as anonymous contributions?',
        deleteNotesChoice: 'Delete your notes?\n\nYES = Delete all notes\nNO = Keep notes as anonymous contributions',
        finalDeleteConfirmation: '🚨 FINAL CONFIRMATION 🚨\n\nThis is your last chance to cancel.\n\nYou chose to: {choice}\n\nAre you absolutely sure you want to delete your account?',
        deleteChoiceDelete: 'DELETE all notes',
        deleteChoiceKeep: 'KEEP notes anonymously'
      }
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
      loadingTitle: 'Laster...',
      offlineNotice: 'Du er frakoblet. Noen funksjoner kan være begrenset til tilkoblingen er tilbake.',
      onlineNotice: 'Tilkoblingen er tilbake. Du er online igjen.'
    },
    auth: {
      errors: {
        passwordsMismatch: 'Passordene samsvarer ikke',
        tosRequired: 'Du må godta bruksvilkårene',
        registrationFailed: 'Registrering mislyktes',
        loginFailed: 'Innlogging mislyktes',
        sessionExpired: 'Økten er utløpt. Vennligst logg inn på nytt.',
        tokenRefreshFailed: 'Oppdatering av token mislyktes',
        getUserFailed: 'Kunne ikke hente bruker'
      },
      actions: {
        creatingAccount: 'Oppretter konto...',
        createAccount: 'Opprett konto',
        loggingIn: 'Logger inn...',
        login: 'Logg inn'
      }
    },
    notes: {
      errors: {
        fillTitleAndContent: 'Vennligst fyll ut både tittel og innhold',
        saveFailed: 'Kunne ikke lagre notat: {message}',
        loadFailed: 'Kunne ikke laste notater: {message}',
        deleteFailed: 'Kunne ikke slette notat: {message}'
      },
      prompts: {
        confirmDelete: 'Er du sikker på at du vil slette dette notatet?'
      }
    },
    account: {
      errors: {
        exportFailed: 'Eksport mislyktes: {message}',
        deletionFailed: 'Sletting av konto mislyktes: {message}'
      },
      success: {
        exportDone: 'Data eksportert! Sjekk nedlastingene dine.',
        deletionDone: 'Kontoen ble slettet. Du blir sendt til innlogging.'
      },
      prompts: {
        deleteWarning: '⚠️ ADVARSEL: Dette vil slette kontoen din permanent!\n\nDenne handlingen kan ikke angres. Alle data vil bli slettet permanent innen 48 timer.\n\nVil du slette notatene dine eller beholde dem som anonyme bidrag?',
        deleteNotesChoice: 'Slette notatene dine?\n\nJA = Slett alle notater\nNEI = Behold notater anonymt',
        finalDeleteConfirmation: '🚨 SISTE BEKREFTELSE 🚨\n\nDette er siste sjanse til å avbryte.\n\nDu valgte å: {choice}\n\nEr du helt sikker på at du vil slette kontoen din?',
        deleteChoiceDelete: 'SLETTE alle notater',
        deleteChoiceKeep: 'BEHOLDE notater anonymt'
      }
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

function getTranslationValue(locale, key) {
  const dict = translations[locale];
  if (!dict) {
    return undefined;
  }

  return key.split('.').reduce((cursor, part) => cursor?.[part], dict);
}

export function t(key, params = {}, locale = activeLocale) {
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
