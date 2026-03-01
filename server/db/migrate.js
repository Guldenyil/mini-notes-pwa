import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { pool } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Connecting to PostgreSQL database...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Executing schema...');
    
    // Execute schema as a single transaction
    await client.query('BEGIN');
    await client.query(schema);
    await client.query('COMMIT');
    
    console.log('✅ Database schema created successfully!');
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables created:');
    result.rows.forEach(row => console.log('  - ' + row.table_name));
    
    // Check users count
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`\n👥 Users: ${usersCount.rows[0].count}`);
    
    // Check notes count
    const notesCount = await client.query('SELECT COUNT(*) FROM notes');
    console.log(`📝 Notes: ${notesCount.rows[0].count}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
