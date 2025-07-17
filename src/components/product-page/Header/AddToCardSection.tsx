// src/components/product-page/Header/AddToCartSection.tsx
'use client';

import CartCounter from '@/components/ui/CartCounter';
import React, { useState } from 'react';
import AddToCartBtn from './AddToCartBtn';
import { Product } from '@/types/product.types';
import { FaExclamationTriangle } from 'react-icons/fa';

interface AddToCartSectionProps {
  data: Product;
  selectedParameters: { [parameterId: number]: string[] };
  isParameterSelectionValid: boolean;
}

const AddToCartSection: React.FC<AddToCartSectionProps> = ({ 
  data, 
  selectedParameters, 
  isParameterSelectionValid 
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [showValidationError, setShowValidationError] = useState(false);

  const handleAddToCart = () => {
    if (!isParameterSelectionValid) {
      setShowValidationError(true);
      // Scroll to parameter selection
      const parameterSection = document.getElementById('parameter-selection');
      if (parameterSection) {
        parameterSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setShowValidationError(false);
    // The actual add to cart logic will be handled by AddToCartBtn
  };

  return (
    <div className="space-y-4">
      {/* Validation Error Message */}
      {showValidationError && !isParameterSelectionValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FaExclamationTriangle className="w-5 h-5 text-red-500" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Configuration Required</h4>
              <p className="text-sm text-red-700 mt-1">
                Please complete all required product specifications before adding to cart.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Section */}
      <div className="fixed md:relative w-full bg-white border-t md:border-none border-black/5 bottom-0 left-0 p-4 md:p-0 z-10 flex items-center justify-between sm:justify-start md:justify-center">
        <CartCounter onAdd={setQuantity} onRemove={setQuantity} />
        <AddToCartBtn 
          data={data} 
          quantity={quantity} 
          selectedParameters={selectedParameters}
          isParameterSelectionValid={isParameterSelectionValid}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
};

export default AddToCartSection;