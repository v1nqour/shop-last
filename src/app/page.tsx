export const dynamic = 'force-dynamic';

import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { reviewsData } from "../data/reviews";
import { getProductsByCategory } from "@/lib/productUtils";
import { t } from "@/lib/translations";

export default async function Home() {
  let newArrivalsData = [];
  let topSellingData = [];

  try {
    newArrivalsData = await getProductsByCategory('newArrivals');
    topSellingData = await getProductsByCategory('topSelling');
  } catch (error) {
    console.error('Error fetching products:', error);
    return (
      <div>
        <Header />
        <Brands />
        <main className="my-[50px] sm:my-[72px]">
          <div className="text-center py-8 text-gray-600">{t('homepage.errorLoadingProducts')}</div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Brands />
      <main className="my-[50px] sm:my-[72px]">
        <ProductListSec
          title={t('homepage.newArrivals')}
          data={newArrivalsData}
          viewAllLink="/shop#new-arrivals"
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title={t('homepage.topSelling')}
            data={topSellingData}
            viewAllLink="/shop#top-selling"
          />
        </div>
        <Reviews data={reviewsData} />
      </main>
    </>
  );
}