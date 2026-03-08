import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { query } from './db/connection.js';
import { authenticate } from './middleware/auth.js';
import { localeMiddleware } from './middleware/locale.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { t } from './i18n/index.js';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/account.js';
import notesRoutes from './routes/notes.js';

const app = express();
const port = process.env.PORT || 3000;

function getAllowedOrigins() {
  const configuredOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  if (process.env.NODE_ENV === 'production') {
    return [];
  }

  return ['http://localhost:5173'];
}

const allowedOrigins = getAllowedOrigins();
const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
};

app.use(localeMiddleware);
app.use(cors(corsOptions));
app.use(express.json());
app.use(authenticate);

app.use('/api', apiRateLimiter);

app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.json({ status: 'ok', database: 'disconnected', error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/notes', notesRoutes);

app.use((error, req, res, next) => {
  if (error?.message === 'Not allowed by CORS') {
    const locale = req?.locale || 'en';
    res.status(403).json({ message: t(locale, 'errors.corsNotAllowed') });
    return;
  }

  next(error);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
