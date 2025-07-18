import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, ProductFamily } from '@/types/product.types';

interface FamilyProductsPageProps {
  params: {
    familyId: string;
  };
  searchParams: {
    name?: string;
  };
}

async function getProductsByFamily(familyId: string): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/products/by-family?familyId=${familyId}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching products by family:', error);
    return [];
  }
}

async function getFamilyDetails(familyId: string): Promise<ProductFamily | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/families`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch families');
    }
    
    const families: ProductFamily[] = await response.json();
    return families.find(family => family.id === parseInt(familyId)) || null;
  } catch (error) {
    console.error('Error fetching family details:', error);
    return null;
  }
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
        <Image
          src={product.srcUrl}
          alt={product.title}
          width={400}
          height={400}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-gray-500 ml-2">({product.rating})</span>
          </div>
          
          <div className="text-right">
            {product.disablePrice ? (
              <span className="text-sm text-gray-600">Contact for pricing</span>
            ) : (
              <span className="text-lg font-semibold text-gray-900">
                Starting from MAD {product.price}
              </span>
            )}
          </div>
        </div>
        
        <Link
          href={`/shop/product/${product.id}/${product.title.split(" ").join("-")}`}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center block"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default async function FamilyProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ familyId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const familyId = resolvedParams.familyId;
  const [products, familyDetails] = await Promise.all([
    getProductsByFamily(familyId),
    getFamilyDetails(familyId)
  ]);
  
  if (!familyDetails) {
    notFound();
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-blue-600">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{familyDetails.name}</span>
        </nav>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {familyDetails.name}
            </h1>
            {familyDetails.description && (
              <p className="text-lg text-gray-600">
                {familyDetails.description}
              </p>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>
      
      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              There are currently no products in the {familyDetails.name} family.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}