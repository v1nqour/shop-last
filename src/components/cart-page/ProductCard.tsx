"use client";

import React, { useState, useEffect } from "react";
import { PiTrashFill } from "react-icons/pi";
import Image from "next/image";
import Link from "next/link";
import CartCounter from "@/components/ui/CartCounter";
import { Button } from "../ui/button";
import {
  addToCart,
  CartItem,
  remove,
  removeCartItem,
} from "@/lib/features/carts/cartsSlice";
import { useAppDispatch } from "@/lib/hooks/redux";

type ProductCardProps = {
  data: CartItem;
};

const ProductCard = ({ data }: ProductCardProps) => {
  const discountPercentage = 0; // No discount anymore
  const discountAmount = 0;
  const [parametersData, setParametersData] = useState<any[]>([]);
  
  const dispatch = useAppDispatch();

  // Load parameter data for this cart item
  useEffect(() => {
    const loadParameterData = async () => {
      const paramAttribute = data.attributes.find(attr => attr.startsWith('param_'));
      if (paramAttribute) {
        try {
          const paramInfo = paramAttribute.split('|').map(param => {
            const [paramId, values] = param.replace('param_', '').split(':');
            return {
              parameterId: paramId,
              valueIds: values.split(',')
            };
          });
          
          const parameters = [];
          for (const param of paramInfo) {
            try {
              const response = await fetch(`/api/products/${data.id}/parameters`);
              if (response.ok) {
                const allParameters = await response.json();
                const matchingParameter = allParameters.find((p: any) => p.id.toString() === param.parameterId);
                
                if (matchingParameter) {
                  const selectedValues = matchingParameter.values.filter((v: any) => 
                    param.valueIds.includes(v.id.toString())
                  );
                  
                  parameters.push({
                    name: matchingParameter.parameter_name,
                    values: selectedValues.map((v: any) => v.value_name)
                  });
                }
              }
            } catch (error) {
              console.error('Error fetching parameter data:', error);
            }
          }
          
          setParametersData(parameters);
        } catch (error) {
          console.error('Error parsing parameter data:', error);
        }
      }
    };

    loadParameterData();
  }, [data.id, data.attributes]);

  return (
    <div className="flex items-start space-x-4">
      <Link
        href={`/shop/product/${data.id}/${data.name.split(" ").join("-")}`}
        className="bg-[#F0EEED] rounded-lg w-full min-w-[100px] max-w-[100px] sm:max-w-[124px] aspect-square overflow-hidden"
      >
        <Image
          src={data.srcUrl}
          width={124}
          height={124}
          className="rounded-md w-full h-full object-cover hover:scale-110 transition-all duration-500"
          alt={data.name}
          priority
        />
      </Link>
      <div className="flex w-full self-stretch flex-col">
        <div className="flex items-center justify-between">
          <Link
            href={`/shop/product/${data.id}/${data.name.split(" ").join("-")}`}
            className="text-black font-bold text-base xl:text-xl"
          >
            {data.name}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 md:h-9 md:w-9"
            onClick={() =>
              dispatch(
                remove({
                  id: data.id,
                  attributes: data.attributes,
                  quantity: data.quantity,
                })
              )
            }
          >
            <PiTrashFill className="text-xl md:text-2xl text-red-600" />
          </Button>
        </div>
        
        {/* Show selected parameters in table format */}
        {parametersData.length > 0 && (
          <div className="my-3 bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-800 mb-2">Selected Configuration</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1 px-2 font-medium text-gray-600">Parameter</th>
                    <th className="text-left py-1 px-2 font-medium text-gray-600">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {parametersData.map((param, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-1 px-2 text-gray-700">{param.name}</td>
                      <td className="py-1 px-2 text-gray-900">{param.values.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="flex items-center flex-wrap justify-between">
          <div className="flex items-center space-x-[5px] xl:space-x-2.5">
            {data.disablePrice ? (
              <span className="font-medium text-black text-base xl:text-lg">
                Contact us for pricing details
              </span>
            ) : (
              <>
                <span className="font-bold text-black text-xl xl:text-2xl">
                  Starting from MAD {data.price}
                </span>
              </>
            )}
          </div>
          <CartCounter
            initialValue={data.quantity}
            onAdd={() => dispatch(addToCart({ ...data, quantity: 1 }))}
            onRemove={() =>
              data.quantity === 1
                ? dispatch(
                    remove({
                      id: data.id,
                      attributes: data.attributes,
                      quantity: data.quantity,
                    })
                  )
                : dispatch(
                    removeCartItem({ id: data.id, attributes: data.attributes })
                  )
            }
            isZeroDelete
            className="px-5 py-3 max-h-8 md:max-h-10 min-w-[105px] max-w-[105px] sm:max-w-32"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;