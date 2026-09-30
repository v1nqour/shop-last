import { notFound } from 'next/navigation';
import ProductListSec from '@/components/common/ProductListSec';
import BreadcrumbProduct from '@/components/product-page/BreadcrumbProduct';
import Header from '@/components/product-page/Header';
import { getProducts } from '@/lib/productUtils';

interface ProductPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products
      .filter(product => typeof product.id === 'string' && product.id.trim())
      .map(product => ({
        slug: [product.id],
      }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  try {
    const resolvedParams = await params;
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const { slug } = resolvedParams;
    const productId = slug[0];

    const allProducts = await getProducts();
    const productData = allProducts.find(product => product.id === productId);

    if (!productData) {
      console.error(`Product not found for id: ${productId}`);
      notFound();
    }

    let relatedProducts = allProducts
      .filter(p => p.category === productData.category && p.id !== productData.id)
      .slice(0, 4);

    if (relatedProducts.length === 0) {
      relatedProducts = allProducts
        .filter(p => p.id !== productData.id)
        .slice(0, 4);
    }

    return (
      <main>
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
          <BreadcrumbProduct title={productData.title} />
          <section className="mb-11">
            <Header data={productData} />
          </section>
        </div>
        {relatedProducts.length > 0 && (
          <div className="mb-[50px] sm:mb-20">
            <ProductListSec title="Related Products ⭐" data={relatedProducts} />
          </div>
        )}
      </main>
    );
  } catch (error) {
    console.error('Error in ProductPage:', error);
    return (
      <div className="max-w-frame mx-auto px-4 xl:px-0 py-10">
        <h2 className="text-2xl font-bold">Error loading product</h2>
        <p className="mt-2">Please try again later.</p>
      </div>
    );
  }
}
