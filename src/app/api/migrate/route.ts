import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Test if product_parameters table exists
    const testResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'product_parameters'
    `;

    if (testResult.length === 0) {
      // Create the tables
      await sql`
        CREATE TABLE IF NOT EXISTS product_parameters (
            id SERIAL PRIMARY KEY,
            product_id VARCHAR(50) NOT NULL,
            parameter_name VARCHAR(100) NOT NULL,
            parameter_type VARCHAR(50) DEFAULT 'dropdown',
            is_required BOOLEAN DEFAULT false,
            display_order INTEGER DEFAULT 0,
            depends_on_parameter INTEGER REFERENCES product_parameters(id) ON DELETE SET NULL,
            depends_on_value VARCHAR(200),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(product_id, parameter_name)
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS product_parameter_values (
            id SERIAL PRIMARY KEY,
            parameter_id INTEGER REFERENCES product_parameters(id) ON DELETE CASCADE,
            value_name VARCHAR(200) NOT NULL,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS product_parameter_selections (
            id SERIAL PRIMARY KEY,
            product_id VARCHAR(50) NOT NULL,
            parameter_id INTEGER REFERENCES product_parameters(id) ON DELETE CASCADE,
            selected_values TEXT[],
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create indexes
      await sql`CREATE INDEX IF NOT EXISTS idx_product_parameters_product_id ON product_parameters(product_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_parameters_display_order ON product_parameters(display_order)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_parameters_depends_on ON product_parameters(depends_on_parameter)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_parameter_values_parameter_id ON product_parameter_values(parameter_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_parameter_values_display_order ON product_parameter_values(display_order)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_parameter_selections_product_id ON product_parameter_selections(product_id)`;

      return NextResponse.json({ message: 'Database migration completed successfully!', created: true });
    } else {
      return NextResponse.json({ message: 'Database tables already exist', created: false });
    }
  } catch (error: unknown) {
    console.error('Migration error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ error: 'Migration failed', details: message }, { status: 500 });
  }
}
