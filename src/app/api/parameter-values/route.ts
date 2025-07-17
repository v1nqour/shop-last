import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parameterId = searchParams.get('parameterId');
    
    
    if (!parameterId) {
      return NextResponse.json({ error: 'Parameter ID is required' }, { status: 400 });
    }
    
    const values = await sql`
      SELECT * FROM parameter_values 
      WHERE parameter_id = ${parameterId} 
      ORDER BY display_order
    `;
    
    return NextResponse.json(values);
  } catch (error) {
    console.error('Error fetching parameter values:', error);
    return NextResponse.json({ error: 'Failed to fetch parameter values' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { parameter_id, value_name, display_order } = await request.json();
    
    const result = await sql`
      INSERT INTO parameter_values (parameter_id, value_name, value_name_fr, display_order)
      VALUES (${parameter_id}, ${value_name}, ${value_name}, ${display_order})
      RETURNING *
    `;
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating parameter value:', error);
    return NextResponse.json({ error: 'Failed to create parameter value' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, value_name, display_order } = await request.json();
    
    const result = await sql`
      UPDATE parameter_values 
      SET value_name = ${value_name}, value_name_fr = ${value_name}, display_order = ${display_order}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Parameter value not found' }, { status: 404 });
    }
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating parameter value:', error);
    return NextResponse.json({ error: 'Failed to update parameter value' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Parameter value ID is required' }, { status: 400 });
    }
    
    const result = await sql`
      DELETE FROM parameter_values WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Parameter value not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting parameter value:', error);
    return NextResponse.json({ error: 'Failed to delete parameter value' }, { status: 500 });
  }
}