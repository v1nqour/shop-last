import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET: Fetch product parameters
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    const parameters = await sql`
      SELECT 
        pp.id,
        pp.product_id,
        pp.parameter_name,
        pp.parameter_type,
        pp.is_required,
        pp.display_order,
        pp.depends_on_parameter,
        pp.depends_on_value,
        pp.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ppv.id,
              'parameter_id', ppv.parameter_id,
              'value_name', ppv.value_name,
              'display_order', ppv.display_order
            )
            ORDER BY ppv.display_order
          ) FILTER (WHERE ppv.id IS NOT NULL),
          '[]'::json
        ) AS values
      FROM product_parameters pp
      LEFT JOIN product_parameter_values ppv
        ON pp.id = ppv.parameter_id
      WHERE pp.product_id = ${productId}
      GROUP BY pp.id
      ORDER BY pp.display_order
    `;

    return NextResponse.json(parameters);
  } catch (error) {
    console.error('Error fetching product parameters:', error);

    return NextResponse.json(
      { error: 'Failed to fetch product parameters' },
      { status: 500 }
    );
  }
}

// POST: Create new product parameter
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    const {
      parameter_name,
      parameter_type,
      is_required,
      display_order,
      depends_on_parameter,
      depends_on_value,
      values,
    } = await request.json();

    const result = await sql`
      INSERT INTO product_parameters (
        product_id,
        parameter_name,
        parameter_type,
        is_required,
        display_order,
        depends_on_parameter,
        depends_on_value
      )
      VALUES (
        ${productId},
        ${parameter_name},
        ${parameter_type},
        ${is_required},
        ${display_order},
        ${depends_on_parameter},
        ${depends_on_value}
      )
      RETURNING *
    `;

    const parameter = result[0];

    if (values && values.length > 0) {
      for (const value of values) {
        if (value.value_name && value.value_name.trim() !== '') {
          await sql`
            INSERT INTO product_parameter_values (
              parameter_id,
              value_name,
              display_order
            )
            VALUES (
              ${parameter.id},
              ${value.value_name},
              ${value.display_order || 0}
            )
          `;
        }
      }
    }

    return NextResponse.json(parameter);
  } catch (error) {
    console.error('Error creating product parameter:', error);

    return NextResponse.json(
      { error: 'Failed to create product parameter' },
      { status: 500 }
    );
  }
}

// PUT: Update existing product parameter
export async function PUT(request: NextRequest) {
  try {
    const {
      id,
      parameter_name,
      parameter_type,
      is_required,
      display_order,
      depends_on_parameter,
      depends_on_value,
    } = await request.json();

    const result = await sql`
      UPDATE product_parameters
      SET
        parameter_name = ${parameter_name},
        parameter_type = ${parameter_type},
        is_required = ${is_required},
        display_order = ${display_order},
        depends_on_parameter = ${depends_on_parameter},
        depends_on_value = ${depends_on_value}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Product parameter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating product parameter:', error);

    return NextResponse.json(
      { error: 'Failed to update product parameter' },
      { status: 500 }
    );
  }
}

// DELETE: Remove product parameter
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Parameter ID is required' },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM product_parameter_values
      WHERE parameter_id = ${id}
    `;

    const result = await sql`
      DELETE FROM product_parameters
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Product parameter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product parameter:', error);

    return NextResponse.json(
      { error: 'Failed to delete product parameter' },
      { status: 500 }
    );
  }
}