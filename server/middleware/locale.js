import { resolveRequestLocale } from '../i18n/index.js';

export function localeMiddleware(req, res, next) {
  const acceptLanguage = req.headers['accept-language'];
  const locale = resolveRequestLocale(acceptLanguage);

  req.locale = locale;
  res.setHeader('Content-Language', locale);

  next();
}
