import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { query } from './db/connection.js';
import { authenticate } from './middleware/auth.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/account.js';
import notesRoutes from './routes/notes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
