const SUPPORTED_LOCALES = ['en', 'no'];
const DEFAULT_LOCALE = 'en';
const LOCALE_STORAGE_KEY = 'mini-notes-locale';

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
      ui: {
        registerTitle: 'Create Account',
        registerSubtitle: 'Join Mini Notes to start taking notes',
        usernameLabel: 'Username',
        usernameHint: '3-30 characters, letters, numbers, - and _ only',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        passwordPlaceholder: 'At least 8 characters',
        passwordHint: 'Minimum 8 characters',
        passwordConfirmLabel: 'Confirm Password',
        passwordConfirmPlaceholder: 'Repeat your password',
        tosBullet1: 'You own your data completely',
        tosBullet2: 'We collect minimal personal info (email, username)',
        tosBullet3: 'We never sell or share your data',
        tosBullet4: 'You can export or delete your data anytime',
        tosBullet5: 'GDPR compliant with full user rights',
        tosAgreementPrefix: 'I have read and agree to the',
        termsLink: 'Terms of Service',
        privacyLink: 'Privacy Policy',
        alreadyHaveAccount: 'Already have an account?',
        noAccountYet: "Don't have an account?",
        welcomeBack: 'Welcome Back',
        loginSubtitle: 'Login to Mini Notes',
        loginLink: 'Login',
        registerLink: 'Register'
      },
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
      ui: {
        settings: 'Settings',
        logout: 'Logout',
        yourNotes: 'Your Notes',
        newNote: '+ New Note',
        searchNotes: 'Search notes...',
        loadingNotes: 'Loading notes...',
        noteTitle: 'Note title',
        noteContent: 'Note content',
        noteCategory: 'Note category',
        noteTitlePlaceholder: 'Note title',
        noteContentPlaceholder: 'Write your note here...',
        noteCategoryPlaceholder: 'Category (optional)',
        pinThisNote: '📌 Pin this note',
        cancel: 'Cancel',
        saveNote: 'Save Note',
        editNote: 'Edit Note',
        newNoteTitle: 'New Note',
        noNotesYet: 'No notes yet. Click "+ New Note" to create one!',
        openNote: 'Open note',
        edit: 'Edit',
        delete: 'Delete',
        closeNoteEditor: 'Close note editor',
        viewNote: 'View note',
        closeNote: 'Close note',
        category: 'Category:',
        created: 'Created:',
        updated: 'Updated:',
        close: 'Close'
      },
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
      ui: {
        title: 'Account Settings',
        backToNotes: '← Back to Notes',
        logout: 'Logout',
        accountInformation: 'Account Information',
        username: 'Username:',
        email: 'Email:',
        memberSince: 'Member Since:',
        dataManagement: 'Data Management',
        exportAllData: 'Export All Data',
        exportHelp: 'Download all your notes and account data in JSON format',
        legalDocuments: 'Legal Documents',
        viewTos: 'View Terms of Service',
        viewPrivacy: 'View Privacy Policy',
        tosVersion: 'ToS Version:',
        dangerZone: '⚠️ Danger Zone',
        dangerText: 'Account deletion is permanent and cannot be undone. All your data will be permanently deleted within 48 hours.',
        deleteAccount: 'Delete Account'
      },
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
    },
    localeSwitcher: {
      label: 'Language switcher',
      switchToEnglish: 'Switch language to English',
      switchToNorwegian: 'Switch language to Norwegian'
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
      ui: {
        registerTitle: 'Opprett konto',
        registerSubtitle: 'Bli med i Mini Notes for å begynne å skrive notater',
        usernameLabel: 'Brukernavn',
        usernameHint: '3-30 tegn, kun bokstaver, tall, - og _',
        emailLabel: 'E-post',
        passwordLabel: 'Passord',
        passwordPlaceholder: 'Minst 8 tegn',
        passwordHint: 'Minimum 8 tegn',
        passwordConfirmLabel: 'Bekreft passord',
        passwordConfirmPlaceholder: 'Gjenta passordet ditt',
        tosBullet1: 'Du eier dataene dine fullt ut',
        tosBullet2: 'Vi samler kun minimum av persondata (e-post, brukernavn)',
        tosBullet3: 'Vi selger eller deler aldri dataene dine',
        tosBullet4: 'Du kan eksportere eller slette dataene dine når som helst',
        tosBullet5: 'GDPR-kompatibel med fulle brukerrettigheter',
        tosAgreementPrefix: 'Jeg har lest og godtar',
        termsLink: 'Bruksvilkår',
        privacyLink: 'Personvernerklæring',
        alreadyHaveAccount: 'Har du allerede en konto?',
        noAccountYet: 'Har du ikke en konto?',
        welcomeBack: 'Velkommen tilbake',
        loginSubtitle: 'Logg inn på Mini Notes',
        loginLink: 'Logg inn',
        registerLink: 'Registrer deg'
      },
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
      ui: {
        settings: 'Innstillinger',
        logout: 'Logg ut',
        yourNotes: 'Notatene dine',
        newNote: '+ Nytt notat',
        searchNotes: 'Søk i notater...',
        loadingNotes: 'Laster notater...',
        noteTitle: 'Notattittel',
        noteContent: 'Notatinnhold',
        noteCategory: 'Notatkategori',
        noteTitlePlaceholder: 'Notattittel',
        noteContentPlaceholder: 'Skriv notatet ditt her...',
        noteCategoryPlaceholder: 'Kategori (valgfritt)',
        pinThisNote: '📌 Fest dette notatet',
        cancel: 'Avbryt',
        saveNote: 'Lagre notat',
        editNote: 'Rediger notat',
        newNoteTitle: 'Nytt notat',
        noNotesYet: 'Ingen notater ennå. Klikk "+ Nytt notat" for å opprette et!',
        openNote: 'Åpne notat',
        edit: 'Rediger',
        delete: 'Slett',
        closeNoteEditor: 'Lukk notatredigering',
        viewNote: 'Vis notat',
        closeNote: 'Lukk notat',
        category: 'Kategori:',
        created: 'Opprettet:',
        updated: 'Oppdatert:',
        close: 'Lukk'
      },
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
      ui: {
        title: 'Kontoinnstillinger',
        backToNotes: '← Tilbake til notater',
        logout: 'Logg ut',
        accountInformation: 'Kontoinformasjon',
        username: 'Brukernavn:',
        email: 'E-post:',
        memberSince: 'Medlem siden:',
        dataManagement: 'Datahåndtering',
        exportAllData: 'Eksporter alle data',
        exportHelp: 'Last ned alle notater og kontodata i JSON-format',
        legalDocuments: 'Juridiske dokumenter',
        viewTos: 'Se bruksvilkår',
        viewPrivacy: 'Se personvernerklæring',
        tosVersion: 'ToS-versjon:',
        dangerZone: '⚠️ Faresone',
        dangerText: 'Sletting av konto er permanent og kan ikke angres. Alle data vil bli slettet permanent innen 48 timer.',
        deleteAccount: 'Slett konto'
      },
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
    },
    localeSwitcher: {
      label: 'Språkvelger',
      switchToEnglish: 'Bytt språk til engelsk',
      switchToNorwegian: 'Bytt språk til norsk'
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
  let preferredLocale = null;

  if (typeof localStorage !== 'undefined') {
    preferredLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
  }

  activeLocale = preferredLocale
    ? normalizeLocale(preferredLocale)
    : detectBrowserLocale();

  if (typeof document !== 'undefined') {
    document.documentElement.lang = activeLocale;
  }

  return activeLocale;
}

export function getCurrentLocale() {
  return activeLocale;
}

export function setLocale(locale) {
  const normalizedLocale = normalizeLocale(locale);
  activeLocale = normalizedLocale;

  if (typeof document !== 'undefined') {
    document.documentElement.lang = activeLocale;
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCALE_STORAGE_KEY, activeLocale);
  }

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
