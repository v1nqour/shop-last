import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; parameterId: string }> }
) {
  try {
    const { productId, parameterId } = await params; // assuming /product/:productId/:parameterId

    const values = await sql`
      SELECT * FROM product_parameter_values 
      WHERE parameter_id = ${parameterId} 
      ORDER BY display_order
    `;

    return NextResponse.json(values);
  } catch (error) {
    console.error('Error fetching product parameter values:', error);
    return NextResponse.json({ error: 'Failed to fetch product parameter values' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; parameterId: string }> }
) {
  try {
    const { productId, parameterId } = await params;
    const { value_name, display_order } = await request.json();

    const result = await sql`
      INSERT INTO product_parameter_values (parameter_id, value_name, display_order)
      VALUES (${parameterId}, ${value_name}, ${display_order})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating product parameter value:', error);
    return NextResponse.json({ error: 'Failed to create product parameter value' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
) {
  try {
    const { id, value_name, display_order } = await request.json();

    const result = await sql`
      UPDATE product_parameter_values 
      SET value_name = ${value_name}, display_order = ${display_order}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Product parameter value not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating product parameter value:', error);
    return NextResponse.json({ error: 'Failed to update product parameter value' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,

) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Parameter value ID is required' }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM product_parameter_values WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Product parameter value not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product parameter value:', error);
    return NextResponse.json({ error: 'Failed to delete product parameter value' }, { status: 500 });
  }
}
