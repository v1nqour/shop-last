import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');
    
    if (!familyId) {
      return NextResponse.json({ error: 'Family ID is required' }, { status: 400 });
    }
    
    const parameters = await sql`
      SELECT 
        fp.*,
        json_agg(
          json_build_object(
            'id', pv.id,
            'parameter_id', pv.parameter_id,
            'value_name', pv.value_name,
            'display_order', pv.display_order
          ) ORDER BY pv.display_order
        ) as values
      FROM family_parameters fp
      LEFT JOIN parameter_values pv ON fp.id = pv.parameter_id
      WHERE fp.family_id = ${familyId}
      GROUP BY fp.id
      ORDER BY fp.display_order
    `;
    
    const formattedParameters = parameters.map(param => ({
      id: param.id,
      family_id: param.family_id,
      parameter_name: param.parameter_name,
      parameter_type: param.parameter_type,
      is_required: param.is_required,
      display_order: param.display_order,
      created_at: param.created_at,
      values: param.values ? param.values.filter((v: any) => v.id !== null) : [],
    }));
    
    return NextResponse.json(formattedParameters);
  } catch (error) {
    console.error('Error fetching parameters:', error);
    return NextResponse.json({ error: 'Failed to fetch parameters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      family_id, 
      parameter_name, 
      parameter_type, 
      is_required, 
      display_order 
    } = await request.json();
    
    const result = await sql`
      INSERT INTO family_parameters (
        family_id, parameter_name, parameter_name_fr, parameter_type, is_required, display_order
      )
      VALUES (${family_id}, ${parameter_name}, ${parameter_name}, ${parameter_type}, ${is_required}, ${display_order})
      RETURNING *
    `;
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating parameter:', error);
    return NextResponse.json({ error: 'Failed to create parameter' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { 
      id, 
      parameter_name, 
      parameter_type, 
      is_required, 
      display_order 
    } = await request.json();
    
    const result = await sql`
      UPDATE family_parameters 
      SET 
        parameter_name = ${parameter_name},
        parameter_name_fr = ${parameter_name},
        parameter_type = ${parameter_type},
        is_required = ${is_required},
        display_order = ${display_order}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Parameter not found' }, { status: 404 });
    }
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating parameter:', error);
    return NextResponse.json({ error: 'Failed to update parameter' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Parameter ID is required' }, { status: 400 });
    }
    
    // Delete parameter values first
    await sql`DELETE FROM parameter_values WHERE parameter_id = ${id}`;
    
    // Delete parameter
    const result = await sql`
      DELETE FROM family_parameters WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Parameter not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting parameter:', error);
    return NextResponse.json({ error: 'Failed to delete parameter' }, { status: 500 });
  }
}