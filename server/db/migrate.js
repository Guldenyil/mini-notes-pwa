const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('🔄 Connecting to Neon database...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Executing schema...');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('✅ Database schema created successfully!');
    console.log('✅ Sample data inserted!');
    
    // Verify tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\n📊 Tables created:');
    result.rows.forEach(row => console.log('  - ' + row.table_name));
    
    // Check notes count
    const notesCount = await pool.query('SELECT COUNT(*) FROM notes');
    console.log(`\n📝 Notes in database: ${notesCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
