const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes (placeholders)
app.post('/api/auth/register', (req, res) => {
  res.status(501).json({ message: 'Registration endpoint - not yet implemented' });
});

app.post('/api/auth/login', (req, res) => {
  res.status(501).json({ message: 'Login endpoint - not yet implemented' });
});

// Notes routes (placeholders)
app.get('/api/notes', (req, res) => {
  res.status(501).json({ message: 'Notes endpoint - not yet implemented' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
