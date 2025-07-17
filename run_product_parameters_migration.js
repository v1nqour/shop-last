const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('❌ No database connection string found');
    process.exit(1);
  }
  
  console.log('🔄 Connecting to database...');
  const sql = neon(connectionString);
  
  try {
    // Read and execute the migration script
    const migrationPath = path.join(__dirname, 'product_parameters_to_products_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 Running migration to convert family parameters to product parameters...');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql.unsafe(statement);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Summary:');
    console.log('   - Created product_parameters table');
    console.log('   - Created product_parameter_values table');
    console.log('   - Created product_parameter_selections table');
    console.log('   - Migrated existing family parameters to product parameters');
    console.log('   - Migrated existing parameter values');
    console.log('   - Migrated existing parameter selections');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();