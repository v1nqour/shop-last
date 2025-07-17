"use client";

import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { NavMenu } from "../navbar.types";
import { MenuList } from "./MenuList";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MenuItem } from "./MenuItem";
import Image from "next/image";
import InputGroup from "@/components/ui/input-group";
import ResTopNavbar from "./ResTopNavbar";
import CartBtn from "./CartBtn";
import { Product, ProductFamily } from "@/types/product.types";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import { FiChevronDown, FiPackage } from "react-icons/fi";

const TopNavbar = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [families, setFamilies] = useState<ProductFamily[]>([]);
  const [showFamiliesDropdown, setShowFamiliesDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const familiesRef = useRef<HTMLDivElement>(null);

  // Fetch product families on mount
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const response = await fetch('/api/families');
        const data = await response.json();
        setFamilies(data);
      } catch (error) {
        console.error('Error fetching families:', error);
      }
    };
    
    fetchFamilies();
  }, []);

  const debouncedSearch = debounce(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      const results = await response.json();
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setShowResults(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (familiesRef.current && !familiesRef.current.contains(event.target as Node)) {
        setShowFamiliesDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowResults(false);
    }
  };

  const handleResultClick = (product: Product) => {
    router.push(`/shop/product/${product.id}/${product.title.split(" ").join("-")}`);
    setSearchQuery("");
    setShowResults(false);
  };

  const handleFamilyClick = (familyId: number, familyName: string) => {
    router.push(`/shop/family/${familyId}?name=${encodeURIComponent(familyName)}`);
    setShowFamiliesDropdown(false);
  };

  return (
    <nav className="sticky top-0 bg-white z-20 shadow-sm">
      <div className="flex relative max-w-frame mx-auto items-center justify-between md:justify-start py-5 md:py-6 px-4 xl:px-0">
        <div className="flex items-center">
          <div className="block md:hidden mr-4">
            <ResTopNavbar data={[]} />
          </div>
          <Link href="/" className="flex items-center space-x-3 mr-3 lg:mr-10">
            <Image
              src="/images/logos/Approvisonneur logo.png"
              alt="Approvisonneur Logo"
              width={150}
              height={150}
              className="h-auto w-auto"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 flex-1">
          {/* Product Families Dropdown */}
          <div className="relative" ref={familiesRef}>
            <button
              onClick={() => setShowFamiliesDropdown(!showFamiliesDropdown)}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              <FiPackage size={20} />
              <span>Product Families</span>
              <FiChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${showFamiliesDropdown ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {showFamiliesDropdown && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Industrial Equipment Categories</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {families.map((family) => (
                    <button
                      key={family.id}
                      onClick={() => handleFamilyClick(family.id, family.name)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 border-b border-gray-50 last:border-b-0"
                    >
                      <div className="font-medium">{family.name}</div>
                      {family.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {family.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Regular Navigation Items */}
          <Link 
            href="/shop" 
            className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
          >
            All Products
          </Link>
          <Link 
            href="/shop#new-arrivals" 
            className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
          >
            New Arrivals
          </Link>
          <Link 
            href="/shop#top-selling" 
            className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
          >
            Top Selling
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-xl mr-8" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <InputGroup className="bg-[#F0F0F0] w-full border-none rounded-full overflow-hidden">
              <InputGroup.Text className="pl-4">
                <Image
                  priority
                  src="/icons/search.svg"
                  height={20}
                  width={20}
                  alt="search"
                  className="min-w-5 min-h-5"
                />
              </InputGroup.Text>
              <InputGroup.Input
                type="search"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                placeholder="Search for industrial equipment..."
                className="bg-transparent placeholder:text-black/40 w-full py-3 pr-4 border-none focus:outline-none"
              />
            </InputGroup>
            
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-xl rounded-lg z-50 max-h-96 overflow-y-auto border border-gray-100">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ease-in-out border-b border-gray-100 last:border-b-0"
                    onClick={() => handleResultClick(product)}
                  >
                    <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                      <Image
                        src={product.srcUrl}
                        width={64}
                        height={64}
                        alt={product.name}
                        className="object-cover w-full h-full"
                        priority
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {product.family?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/search" className="block md:hidden mr-[14px] p-1">
            <Image
              priority
              src="/icons/search-black.svg"
              height={100}
              width={100}
              alt="search"
              className="max-w-[22px] max-h-[22px]"
            />
          </Link>
          <CartBtn />
          <Link href="/admin" className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200">
            <Image
              priority
              src="/icons/user.svg"
              height={100}
              width={100}
              alt="user"
              className="max-w-[22px] max-h-[22px]"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;