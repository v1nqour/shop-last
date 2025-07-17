// lib/blob.ts
import { put, del } from '@vercel/blob';
import { Product } from '@/types/product.types';

export const writeProducts = async (products: Product[]) => {
  try {
    console.log('Attempting to write products to blob');
    const response = await put('products.json', JSON.stringify(products), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN // Ensure this is set!
    });
    console.log('Blob write successful:', response);
    return true;
  } catch (error) {
    console.error('Blob write error:', error);
    return false;
  }
};