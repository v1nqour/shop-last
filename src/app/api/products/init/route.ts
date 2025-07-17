// app/api/products/init/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { Product } from '@/types/product.types';

export async function POST() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN not configured');
    }

    // Create initial empty array
    const blob = await put('products.json', JSON.stringify([]), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'application/json',
      addRandomSuffix: false
    });

    return NextResponse.json({
      success: true,
      url: blob.url
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to initialize products' },
      { status: 500 }
    );
  }
}
