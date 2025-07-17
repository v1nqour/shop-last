export const dynamic = 'force-dynamic';

import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { reviewsData } from "../data/reviews";
import { getProductsByCategory } from "@/lib/productUtils";

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
          <div>Error loading products. Please try again later.</div>
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
          title="NEW ARRIVALS"
          data={newArrivalsData}
          viewAllLink="/shop#new-arrivals"
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="TOP SELLING"
            data={topSellingData}
            viewAllLink="/shop#top-selling"
          />
        </div>
        <Reviews data={reviewsData} />
      </main>
    </>
  );
}
