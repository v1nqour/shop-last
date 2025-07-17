import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST() {
  try {
    console.log('🔄 Starting migration to product-based parameters...');

    // Create new product_parameters table (parameters directly linked to products)
    await sql`
      CREATE TABLE IF NOT EXISTS product_parameters (
          id SERIAL PRIMARY KEY,
          product_id VARCHAR(255) NOT NULL,
          parameter_name VARCHAR(255) NOT NULL,
          parameter_type VARCHAR(50) NOT NULL DEFAULT 'dropdown',
          is_required BOOLEAN DEFAULT false,
          display_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create new product_parameter_values table (values for each product parameter)
    await sql`
      CREATE TABLE IF NOT EXISTS product_parameter_values (
          id SERIAL PRIMARY KEY,
          product_parameter_id INTEGER NOT NULL REFERENCES product_parameters(id) ON DELETE CASCADE,
          value_name VARCHAR(255) NOT NULL,
          display_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create new product_parameter_selections table (user selections for each product)
    await sql`
      CREATE TABLE IF NOT EXISTS product_parameter_selections_new (
          id SERIAL PRIMARY KEY,
          product_id VARCHAR(255) NOT NULL,
          product_parameter_id INTEGER NOT NULL REFERENCES product_parameters(id) ON DELETE CASCADE,
          selected_values TEXT[] NOT NULL DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(product_id, product_parameter_id)
      )
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_product_parameters_product_id ON product_parameters(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_parameter_values_parameter_id ON product_parameter_values(product_parameter_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_parameter_selections_product_id ON product_parameter_selections_new(product_id)`;

    // Check if we have existing family parameters to migrate
    const familyParams = await sql`
      SELECT fp.*, p.id as product_id
      FROM family_parameters fp
      JOIN products p ON p.family_id = fp.family_id
      WHERE fp.id IS NOT NULL
    `;

    if (familyParams.length > 0) {
      console.log(`Found ${familyParams.length} family parameters to migrate...`);
      
      // Migrate existing family parameters to product parameters
      for (const param of familyParams) {
        const insertedParams = await sql`
          INSERT INTO product_parameters (product_id, parameter_name, parameter_type, is_required, display_order)
          VALUES (${param.product_id}, ${param.parameter_name}, ${param.parameter_type}, ${param.is_required}, ${param.display_order})
          RETURNING *
        `;
        
        const newParamId = insertedParams[0].id;
        
        // Migrate parameter values
        const paramValues = await sql`
          SELECT * FROM parameter_values WHERE parameter_id = ${param.id}
        `;
        
        for (const value of paramValues) {
          await sql`
            INSERT INTO product_parameter_values (product_parameter_id, value_name, display_order)
            VALUES (${newParamId}, ${value.value_name}, ${value.display_order})
          `;
        }
      }
      
      console.log(`Migrated ${familyParams.length} family parameters to product parameters`);
    }

    // Backup and replace old parameter selections table
    await sql`DROP TABLE IF EXISTS product_parameter_selections_old`;
    
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'product_parameter_selections'
      )
    `;
    
    if (tableExists[0].exists) {
      await sql`ALTER TABLE product_parameter_selections RENAME TO product_parameter_selections_old`;
    }
    
    await sql`ALTER TABLE product_parameter_selections_new RENAME TO product_parameter_selections`;

    console.log('✅ Migration completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully',
      migrated_parameters: familyParams.length
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('❌ Migration failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}