"use client";

import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import { FiSliders } from "react-icons/fi";
import ProductCard from "@/components/common/ProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState } from "react";
import { Product } from "@/types/product.types";
import { useTranslations } from "@/lib/translations";

export default function ShopPage() {
  const { t } = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]); // Store original order
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"none" | "low-price" | "high-price">("none");
  const productsPerPage = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        setProducts(data);
        setOriginalProducts(data); // Save original order
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle sorting
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when sorting changes
    if (sortOrder === "none") {
      setProducts([...originalProducts]); // Restore original order
    } else {
      const sortedProducts = [...products]; // Create a copy to avoid mutating state
      if (sortOrder === "low-price") {
        sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (sortOrder === "high-price") {
        sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
      }
      setProducts(sortedProducts);
    }
  }, [sortOrder, originalProducts]);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="text-center py-10">{t('shop.loadingProducts')}</div>;
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        <div className="flex md:space-x-5 items-start">
          <div className="flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl md:text-[32px]">
                  {t('shop.allProducts')}
                </h1>
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  {t('shop.showing')} {indexOfFirstProduct + 1}-
                  {Math.min(indexOfLastProduct, products.length)} {t('shop.of')}{" "}
                  {products.length} {t('shop.products')}
                </span>
                <div className="flex items-center">
                  {t('shop.sortBy')}{" "}
                  <Select
                    value={sortOrder}
                    onValueChange={(value: "none" | "low-price" | "high-price") =>
                      setSortOrder(value)
                    }
                  >
                    <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
                      <SelectValue placeholder={t('shop.none')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('shop.none')}</SelectItem>
                      <SelectItem value="low-price">{t('shop.lowPrice')}</SelectItem>
                      <SelectItem value="high-price">{t('shop.highPrice')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <ProductCard key={product.id} data={product} />
                ))
              ) : (
                <div className="text-center py-10">{t('shop.noProducts')}</div>
              )}
            </div>

            <hr className="border-t-black/10" />

            {/* Pagination */}
            <Pagination className="justify-between">
              <PaginationPrevious
                href="#"
                className={`border border-black/10 ${
                  currentPage === 1 ? "opacity-50 pointer-events-none" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) paginate(currentPage - 1);
                }}
              >
                {t('shop.previous')}
              </PaginationPrevious>
              <PaginationContent>
                {Array.from({ length: Math.min(5, totalPages) }).map(
                  (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          className={`text-black/50 font-medium text-sm ${
                            currentPage === pageNumber
                              ? "text-black font-bold"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            paginate(pageNumber);
                          }}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                )}

                {totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis className="text-black/50 font-medium text-sm" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        className={`text-black/50 font-medium text-sm ${
                          currentPage === totalPages
                            ? "text-black font-bold"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          paginate(totalPages);
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
              </PaginationContent>

              <PaginationNext
                href="#"
                className={`border border-black/10 ${
                  currentPage === totalPages
                    ? "opacity-50 pointer-events-none"
                    : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) paginate(currentPage + 1);
                }}
              >
                {t('shop.next')}
              </PaginationNext>
            </Pagination>
          </div>
        </div>
      </div>
    </main>
  );
}