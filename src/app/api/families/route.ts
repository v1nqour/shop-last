import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const families = await sql`
      SELECT * FROM product_families ORDER BY name
    `;
    
    return NextResponse.json(families);
  } catch (error) {
    console.error('Error fetching families:', error);
    return NextResponse.json({ error: 'Failed to fetch families' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    
    const result = await sql`
      INSERT INTO product_families (name, name_fr, description)
      VALUES (${name}, ${name}, ${description || ''})
      RETURNING *
    `;
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating family:', error);
    return NextResponse.json({ error: 'Failed to create family' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, description } = await request.json();
    
    const result = await sql`
      UPDATE product_families 
      SET name = ${name}, name_fr = ${name}, description = ${description || ''}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating family:', error);
    return NextResponse.json({ error: 'Failed to update family' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Family ID is required' }, { status: 400 });
    }
    
    // Check if family has products
    const productsCount = await sql`
      SELECT COUNT(*) as count FROM products WHERE family_id = ${id}
    `;
    
    if (productsCount[0].count > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete family with existing products' 
      }, { status: 400 });
    }
    
    // Delete family parameters first
    await sql`DELETE FROM parameter_values WHERE parameter_id IN (
      SELECT id FROM family_parameters WHERE family_id = ${id}
    )`;
    
    await sql`DELETE FROM family_parameters WHERE family_id = ${id}`;
    
    // Delete family
    const result = await sql`
      DELETE FROM product_families WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting family:', error);
    return NextResponse.json({ error: 'Failed to delete family' }, { status: 500 });
  }
}