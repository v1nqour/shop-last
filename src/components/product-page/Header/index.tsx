"use client"; // Mark this as a Client Component

import React, { useState } from "react";
import PhotoSection from "./PhotoSection";
import { Product } from "@/types/product.types";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import Rating from "@/components/ui/Rating";
import AddToCardSection from "./AddToCardSection";
import ProductDetails from "../Tabs/ProductDetails";
import ProductParameterSelection from "../ProductParameterSelection";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Icons for the toggle button

const Header = ({ data }: { data: Product }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false); // State to manage dropdown visibility
  const [selectedParameters, setSelectedParameters] = useState<{ [parameterId: number]: string[] }>({});
  const [isParameterSelectionValid, setIsParameterSelectionValid] = useState(true);

  const discountPercentage = 0; // No discount anymore
  const discountAmount = 0;

  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen); // Toggle visibility
  };

  const handleParameterChange = (selections: { [parameterId: number]: string[] }) => {
    setSelectedParameters(selections);
  };

  const handleValidationChange = (isValid: boolean) => {
    setIsParameterSelectionValid(isValid);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <PhotoSection data={data} />
        </div>
        <div>
          <h1
            className={cn([
              integralCF.className,
              "text-2xl md:text-[40px] md:leading-[40px] mb-3 md:mb-3.5 capitalize",
            ])}
          >
            {data.title}
          </h1>
          <div className="flex items-center mb-3 sm:mb-3.5">
            <Rating
              initialValue={data.rating}
              allowFraction
              SVGclassName="inline-block"
              emptyClassName="fill-gray-50"
              size={25}
              readonly
            />
            <span className="text-black text-xs sm:text-sm ml-[11px] sm:ml-[13px] pb-0.5 sm:pb-0">
              {data.rating.toFixed(1)}
              <span className="text-black/60">/5</span>
            </span>
          </div>
          <div className="flex items-center space-x-2.5 sm:space-x-3 mb-5">
            {data.disablePrice ? (
              <span className="font-medium text-black text-lg sm:text-xl">
                Contact us for pricing details
              </span>
            ) : (
              <>
                {discountPercentage > 0 ? (
                  <span className="font-bold text-black text-2xl sm:text-[32px]">
                    {`MAD ${Math.round(
                      data.price - (data.price * discountPercentage) / 100
                    )}`}
                  </span>
                ) : discountAmount > 0 ? (
                  <span className="font-bold text-black text-2xl sm:text-[32px]">
                    {`MAD ${data.price - discountAmount}`}
                  </span>
                ) : (
                  <span className="font-bold text-black text-2xl sm:text-[32px]">
                    Starting from MAD {data.price}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="font-bold text-black/40 line-through text-2xl sm:text-[32px]">
                    MAD {data.price}
                  </span>
                )}
                {discountAmount > 0 && (
                  <span className="font-bold text-black/40 line-through text-2xl sm:text-[32px]">
                    MAD {data.price}
                  </span>
                )}
                {discountPercentage > 0 ? (
                  <span className="font-medium text-[10px] sm:text-xs py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
                    {`-${discountPercentage}%`}
                  </span>
                ) : (
                  discountAmount > 0 && (
                    <span className="font-medium text-[10px] sm:text-xs py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
                      {`-MAD ${discountAmount}`}
                    </span>
                  )
                )}
              </>
            )}
          </div>
          <p className="text-sm sm:text-base text-black/60 mb-5">
            {data.description}
          </p>
          <hr className="hidden md:block h-[1px] border-t-black/10 my-5" />
        </div>
      </div>

      {/* Product Parameter Selection */}
      <div id="parameter-selection" className="mt-8">
        <ProductParameterSelection
          product={data}
          onParameterChange={handleParameterChange}
          onValidationChange={handleValidationChange}
        />
      </div>

      {/* Add to Cart Section */}
      <div className="mt-8">
        <AddToCardSection 
          data={data}
          selectedParameters={selectedParameters}
          isParameterSelectionValid={isParameterSelectionValid}
        />
      </div>

      {/* Product Details Dropdown */}
      <div className="mt-8">
        <button
          onClick={toggleDetails}
          className="flex items-center justify-between w-full p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300"
        >
          <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
          {isDetailsOpen ? (
            <FaChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <FaChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Collapsible Content */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isDetailsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-4">
            <ProductDetails data={data} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;