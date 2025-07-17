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
    
    const products = await sql`
      SELECT 
        p.*,
        pf.name as family_name,
        pf.description as family_description
      FROM products p
      LEFT JOIN product_families pf ON p.family_id = pf.id
      WHERE p.family_id = ${familyId}
      ORDER BY p.title
    `;
    
    const formattedProducts = products.map(row => ({
      id: String(row.id),
      title: row.title || '',
      srcUrl: row.src_url || '',
      name: row.name || '',
      gallery: Array.isArray(row.gallery) ? row.gallery.filter(Boolean) : [],
      price: parseFloat(row.price) || 0,
      category: row.category || '',
      rating: Number(row.rating) || 0,
      specifications: Array.isArray(row.specifications) ? row.specifications.filter(spec => spec?.label && spec?.value) : [],
      description: row.description || '',
      disablePrice: Boolean(row.disable_price),
      family_id: row.family_id || undefined,
      family: row.family_id ? {
        id: row.family_id,
        name: row.family_name || '',
        description: row.family_description || '',
      } : undefined,
    }));
    
    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products by family:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}