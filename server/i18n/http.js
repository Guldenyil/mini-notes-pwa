import { t } from './index.js';

export function localizeErrorMessage(req, error, fallbackKey = 'errors.generic') {
  const locale = req.locale || 'en';
  const key = error?.messageKey || fallbackKey;
  return t(locale, key, error?.messageParams || {});
}
