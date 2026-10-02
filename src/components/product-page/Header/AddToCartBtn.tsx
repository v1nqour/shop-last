'use client';

import { addToCart } from '@/lib/features/carts/cartsSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { RootState } from '@/lib/store';
import { Product } from '@/types/product.types';
import React, { useState } from 'react';

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
  onAddToCart,
}) => {
  const dispatch = useAppDispatch();

  const { sizeSelection, colorSelection } = useAppSelector(
    (state: RootState) => state.products
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    onAddToCart();

    if (!isParameterSelectionValid || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      // Find the variant matching the selected parameters
      const response = await fetch(`/api/products/${data.id}/variant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedParameters,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to find product variant');
      }

      const variant = await response.json();

      if (!variant?.found || !variant?.variant) {
        throw new Error('No matching product variant found');
      }

      // Use the variant price, NOT the base product price
      const variantPrice = Number(variant.variant.price);

      // Format parameter selections for cart attributes
      const parameterAttributes = Object.entries(selectedParameters)
        .filter(([_, values]) => values.length > 0)
        .map(
          ([parameterId, values]) =>
            `param_${parameterId}:${values.join(',')}`
        )
        .join('|');

      // Combine existing attributes with parameter selections
      const allAttributes = [
        sizeSelection,
        colorSelection.name,
        parameterAttributes,
      ].filter(Boolean);

      dispatch(
        addToCart({
          id: String(data.id),
          name: data.title,
          srcUrl: data.srcUrl,
          price: variantPrice,
          attributes: allAttributes,
          quantity,
          disablePrice: data.disablePrice || false,
        })
      );
    } catch (error) {
      console.error('Error adding product variant to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`w-full ml-3 sm:ml-5 rounded-full h-11 md:h-[52px] text-sm sm:text-base text-white transition-all ${
        isParameterSelectionValid && !isLoading
          ? 'bg-black hover:bg-black/80'
          : 'bg-gray-400 cursor-not-allowed'
      }`}
      onClick={handleClick}
      disabled={!isParameterSelectionValid || isLoading}
    >
      {isLoading
        ? 'Adding...'
        : isParameterSelectionValid
        ? 'Add to Cart'
        : 'Complete Configuration'}
    </button>
  );
};

export default AddToCartBtn;