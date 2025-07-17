// src/components/product-page/Header/AddToCartBtn.tsx
'use client';

import { addToCart } from '@/lib/features/carts/cartsSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { RootState } from '@/lib/store';
import { Product } from '@/types/product.types';
import React from 'react';

interface AddToCartBtnProps {
  data: Product;
  quantity: number;
  selectedParameters: { [parameterId: number]: string[] };
  isParameterSelectionValid: boolean;
  onAddToCart: () => void;
}

const AddToCartBtn: React.FC<AddToCartBtnProps> = ({ 
  data, 
  quantity, 
  selectedParameters, 
  isParameterSelectionValid,
  onAddToCart 
}) => {
  const dispatch = useAppDispatch();
  const { sizeSelection, colorSelection } = useAppSelector(
    (state: RootState) => state.products
  );

  const handleClick = () => {
    onAddToCart();
    
    if (!isParameterSelectionValid) {
      return;
    }

    // Format parameter selections for cart attributes
    const parameterAttributes = Object.entries(selectedParameters)
      .filter(([_, values]) => values.length > 0)
      .map(([parameterId, values]) => `param_${parameterId}:${values.join(',')}`)
      .join('|');

    // Combine existing attributes with parameter selections
    const allAttributes = [
      sizeSelection, 
      colorSelection.name, 
      parameterAttributes
    ].filter(Boolean);

    dispatch(
      addToCart({
        id: data.id,
        name: data.title,
        srcUrl: data.srcUrl,
        price: data.price,
        attributes: allAttributes,
        quantity,
        disablePrice: data.disablePrice || false,
      })
    );
  };

  return (
    <button
      type="button"
      className={`w-full ml-3 sm:ml-5 rounded-full h-11 md:h-[52px] text-sm sm:text-base text-white transition-all ${
        isParameterSelectionValid 
          ? 'bg-black hover:bg-black/80' 
          : 'bg-gray-400 cursor-not-allowed'
      }`}
      onClick={handleClick}
      disabled={!isParameterSelectionValid}
    >
      {isParameterSelectionValid ? 'Add to Cart' : 'Complete Configuration'}
    </button>
  );
};

export default AddToCartBtn;