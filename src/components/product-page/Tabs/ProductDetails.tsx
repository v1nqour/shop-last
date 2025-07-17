import React from "react";
import { Product } from "@/types/product.types"; // Import the Product type

export type SpecItem = {
  label: string;
  value: string;
};

interface ProductDetailsProps {
  data?: Product; // Make the data prop optional
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ data }) => {
  // Ensure data is defined and specifications is an array (default to empty array if undefined)
  const specifications = data?.specifications || [];

  // If there are no specifications, display a fallback message
  if (specifications.length === 0) {
    return (
      <p className="text-neutral-500 text-sm py-3 text-center">
        No specifications available for this product.
      </p>
    );
  }

  return (
    <div>
      {specifications.map((item) => (
        <div
          className="grid grid-cols-3"
          key={`spec-${item.label}`} // Use a unique key based on the label
        >
          <div>
            <p className="text-sm py-3 w-full leading-7 lg:py-4 pr-2 text-neutral-500">
              {item.label}
            </p>
          </div>
          <div className="col-span-2 py-3 lg:py-4 border-b">
            <p className="text-sm w-full leading-7 text-neutral-800 font-medium">
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductDetails;