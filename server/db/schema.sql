-- Mini Notes Database Schema
-- PostgreSQL Database Schema for Notes Application

-- Drop tables if they exist (for development/testing)
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (for future authentication)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category VARCHAR(50),
  color VARCHAR(7),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_notes_category ON notes(category);
CREATE INDEX idx_notes_is_pinned ON notes(is_pinned);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);

-- Create full-text search index for title and content
CREATE INDEX idx_notes_search ON notes USING gin(to_tsvector('english', title || ' ' || content));

-- Insert sample data for testing
INSERT INTO notes (title, content, category, color, is_pinned, created_at, updated_at) VALUES
  ('Shopping List', '- Milk
- Eggs
- Bread', 'personal', '#FFE5B4', TRUE, '2026-01-20 10:30:00', '2026-01-20 10:30:00'),
  ('Meeting Notes', 'Discussed project timeline and deliverables', 'work', '#E3F2FD', FALSE, '2026-01-21 14:15:00', '2026-01-21 16:45:00'),
  ('Recipe Ideas', 'Try making:\n- Pasta carbonara\n- Chicken curry\n- Homemade pizza', 'personal', '#C8E6C9', FALSE, '2026-01-22 09:00:00', '2026-01-22 09:00:00');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_notes_updated_at 
  BEFORE UPDATE ON notes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
