const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    // Check if demo user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', ['demo@test.com']);
    
    if (existing.rows.length > 0) {
      console.log('✅ Demo account already exists: demo@test.com');
    } else {
      // Create demo account
      const hashedPassword = await bcrypt.hash('Demo123!', 12);
      await pool.query(
        'INSERT INTO users (username, email, password_hash, tos_accepted_at, tos_version_accepted) VALUES ($1, $2, $3, NOW(), 1)',
        ['demo', 'demo@test.com', hashedPassword]
      );
      console.log('✅ Demo account created successfully!');
      console.log('   Email: demo@test.com');
      console.log('   Password: Demo123!');
    }
    
    // Create some demo notes for this user
    const user = await pool.query('SELECT id FROM users WHERE email = $1', ['demo@test.com']);
    const userId = user.rows[0].id;
    
    const noteCheck = await pool.query('SELECT COUNT(*) FROM notes WHERE user_id = $1', [userId]);
    if (parseInt(noteCheck.rows[0].count) === 0) {
      await pool.query(
        'INSERT INTO notes (user_id, title, content, category, is_pinned) VALUES ($1, $2, $3, $4, $5)',
        [userId, 'Welcome to Mini Notes!', 'This is a demo note. Feel free to create, edit, or delete notes.', 'Personal', true]
      );
      await pool.query(
        'INSERT INTO notes (user_id, title, content, category) VALUES ($1, $2, $3, $4)',
        [userId, 'Getting Started', 'Try searching, filtering by category, or pinning important notes.', 'Tips']
      );
      console.log('✅ Demo notes created for demo account');
    } else {
      console.log('ℹ️  Demo account already has notes');
    }
    
    await pool.end();
    console.log('\n🎉 Setup complete! You can now login with:');
    console.log('   Email: demo@test.com');
    console.log('   Password: Demo123!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
