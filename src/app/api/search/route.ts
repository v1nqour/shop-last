import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types/product.types';
import { getProducts } from '@/lib/productUtils';

// GET: Search products by query
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  try {
    const products = await getProducts();

    let filteredProducts = products;

    // Filter by search query if provided
    if (query) {
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.specifications.some(spec => 
          spec.label.toLowerCase().includes(query.toLowerCase()) ||
          spec.value.toLowerCase().includes(query.toLowerCase())
        )
      );
    }

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}