import { t } from './index.js';

export function localizeErrorMessage(req, error, fallbackKey = 'errors.generic') {
  const locale = req.locale || 'en';
  const key = error?.messageKey || fallbackKey;
  const localized = t(locale, key, error?.messageParams || {});

  if (localized === key && key !== fallbackKey) {
    return t(locale, fallbackKey, error?.messageParams || {});
  }

  return localized;
}
