'use client';

import BreadcrumbCart from "@/components/cart-page/BreadcrumbCart";
import ProductCard from "@/components/cart-page/ProductCard";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { FaArrowRight } from "react-icons/fa6";
import { MdOutlineLocalOffer } from "react-icons/md";
import { TbBasketExclamation } from "react-icons/tb";
import { IoCheckmarkCircle } from "react-icons/io5";
import React, { useState } from "react";
import { RootState } from "@/lib/store";
import { useAppSelector } from "@/lib/hooks/redux";
import Link from "next/link";

export default function CartPage() {
  const { cart, totalPrice, adjustedTotalPrice } = useAppSelector(
    (state: RootState) => state.carts
  );

  // State for popup visibility and form inputs
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    shippingAddress: "",
    dateLimit: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parametersData, setParametersData] = useState<{ [key: string]: any }>({});

  // Load parameter data for cart items
  React.useEffect(() => {
    const loadParameterData = async () => {
      const paramData: { [key: string]: any } = {};
      
      for (const item of cart.items) {
        const paramAttribute = item.attributes.find(attr => attr.startsWith('param_'));
        if (paramAttribute) {
          try {
            // Parse parameter information from attributes
            const paramInfo = paramAttribute.split('|').map(param => {
              const [paramId, values] = param.replace('param_', '').split(':');
              return {
                parameterId: paramId,
                valueIds: values.split(',')
              };
            });
            
            // Fetch parameter details for each parameter
            for (const param of paramInfo) {
              const response = await fetch(`/api/parameters/${param.parameterId}`);
              if (response.ok) {
                const parameterData = await response.json();
                paramData[`${item.id}_${param.parameterId}`] = {
                  ...parameterData,
                  selectedValues: param.valueIds
                };
              }
            }
          } catch (error) {
            console.error('Error parsing parameter data:', error);
          }
        }
      }
      
      setParametersData(paramData);
    };

    if (cart.items.length > 0) {
      loadParameterData();
    }
  }, [cart.items]);

  // Function to get parameter display for an item
  const getParameterDisplay = (item: any) => {
    const paramAttribute = item.attributes.find((attr: string) => attr.startsWith('param_'));
    if (!paramAttribute) return '';
    
    try {
      const paramInfo = paramAttribute.split('|').map((param: string) => {
        const [paramId, values] = param.replace('param_', '').split(':');
        const paramData = parametersData[`${item.id}_${paramId}`];
        
        if (paramData && paramData.values) {
          const selectedValueNames = values.split(',').map(valueId => {
            const value = paramData.values.find((v: any) => v.id.toString() === valueId);
            return value ? value.value_name : valueId;
          });
          
          return `${paramData.parameter_name}: ${selectedValueNames.join(', ')}`;
        }
        
        return '';
      }).filter(Boolean);
      
      return paramInfo.join('<br>');
    } catch (error) {
      console.error('Error formatting parameter display:', error);
      return '';
    }
  };


  // Check if any items have valid images
  const hasImages = cart?.items?.some(
    (item) =>
      item.srcUrl &&
      typeof item.srcUrl === "string" &&
      item.srcUrl.trim() !== ""
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate inputs
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      companyName,
      shippingAddress,
      dateLimit,
    } = formData;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !companyName ||
      !shippingAddress ||
      !dateLimit
    ) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      setIsLoading(false);
      return;
    }
    if (!/^\+?\d{10,15}$/.test(phoneNumber.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number (10-15 digits)");
      setIsLoading(false);
      return;
    }
    if (new Date(dateLimit) < new Date()) {
      setError("Date limit must be in the future");
      setIsLoading(false);
      return;
    }

    try {
      // Split cart items into priced and price-disabled products
      const pricedItems = cart?.items.filter(
        (item) => !item.disablePrice
      ) || [];
      const disabledPriceItems = cart?.items.filter(
        (item) => item.disablePrice
      ) || [];

      // Generate table for priced products
      const pricedProductTable = pricedItems.length > 0
        ? `
          <h4 style="color: #555;">Priced Products</h4>
          <table style="width: 100%; border-collapse: collapse; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #007bff; color: #fff;">
                ${
                  hasImages
                    ? '<th style="padding: 12px; text-align: left;">Image</th>'
                    : ""
                }
                <th style="padding: 12px; text-align: left;">Product</th>
                <th style="padding: 12px; text-align: left;">Configuration</th>
                <th style="padding: 12px; text-align: left;">Quantity</th>
                <th style="padding: 12px; text-align: left;">Price</th>
                <th style="padding: 12px; text-align: left;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${pricedItems
                .map((item) => {
                  const srcUrl =
                    item.srcUrl && typeof item.srcUrl === "string"
                      ? item.srcUrl.replace(/[<>"'&]/g, "")
                      : "https://via.placeholder.com/50";
                  const altText =
                    item.name && typeof item.name === "string"
                      ? item.name.replace(/[<>"'&]/g, "")
                      : "Product";
                  const discount = 0; // No discount anymore
                  const finalPrice = item.price;
                  const parameterDisplay = getParameterDisplay(item) || 'Standard Configuration';
                  return `
                    <tr style="border-bottom: 1px solid #eee;">
                      ${
                        hasImages
                          ? `
                        <td style="padding: 12px;">
                          <img
                            src="${srcUrl}"
                            alt="${altText}"
                            style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; display: block;"
                          />
                        </td>
                      `
                          : ""
                      }
                      <td style="padding: 12px; color: #555;">${altText}</td>
                      <td style="padding: 12px; color: #555; font-size: 12px;">${parameterDisplay}</td>
                      <td style="padding: 12px; color: #555;">${item.quantity}</td>
                      <td style="padding: 12px; color: #555;">MAD ${finalPrice.toFixed(
                        2
                      )}</td>
                      <td style="padding: 12px; color: #555;">MAD ${(
                        finalPrice * item.quantity
                      ).toFixed(2)}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        `
        : "";

      // Generate table for price-disabled products
      const disabledPriceProductTable = disabledPriceItems.length > 0
        ? `
          <h4 style="color: #555;">Products Requiring Price Confirmation</h4>
          <p style="color: #777; margin-bottom: 10px;">Our team will contact you to provide pricing details for the following items.</p>
          <table style="width: 100%; border-collapse: collapse; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #007bff; color: #fff;">
                ${
                  hasImages
                    ? '<th style="padding: 12px; text-align: left;">Image</th>'
                    : ""
                }
                <th style="padding: 12px; text-align: left;">Product</th>
                <th style="padding: 12px; text-align: left;">Configuration</th>
                <th style="padding: 12px; text-align: left;">Quantity</th>
                <th style="padding: 12px; text-align: left;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${disabledPriceItems
                .map((item) => {
                  const srcUrl =
                    item.srcUrl && typeof item.srcUrl === "string"
                      ? item.srcUrl.replace(/[<>"'&]/g, "")
                      : "https://via.placeholder.com/50";
                  const altText =
                    item.name && typeof item.name === "string"
                      ? item.name.replace(/[<>"'&]/g, "")
                      : "Product";
                  const parameterDisplay = getParameterDisplay(item) || 'Standard Configuration';
                  return `
                    <tr style="border-bottom: 1px solid #eee;">
                      ${
                        hasImages
                          ? `
                        <td style="padding: 12px;">
                          <img
                            src="${srcUrl}"
                            alt="${altText}"
                            style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; display: block;"
                          />
                        </td>
                      `
                          : ""
                      }
                      <td style="padding: 12px; color: #555;">${altText}</td>
                      <td style="padding: 12px; color: #555; font-size: 12px;">${parameterDisplay}</td>
                      <td style="padding: 12px; color: #555;">${item.quantity}</td>
                      <td style="padding: 12px; color: #555;">Contact for Price</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        `
        : "";

      // Calculate totals for priced items only
      const pricedTotal = pricedItems.reduce(
        (sum, item) => {
          const discount = 0; // No discount anymore
          return sum + (item.price - discount) * item.quantity;
        },
        0
      );
      const pricedDiscount = pricedItems.reduce(
        (sum, item) => {
          const discount = 0; // No discount anymore
          return sum + discount * item.quantity;
        },
        0
      );

      // Prepare product details email (HTML string)
      const productTable = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Order Inquiry</h2>
          <h4 style="color: #555;">Customer Information</h4>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: bold; color: #333;">First Name</td>
              <td style="padding: 10px; color: #555;">${firstName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: bold; color: #333;">Last Name</td>
              <td style="padding: 10px; color: #555;">${lastName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: bold; color: #333;">Email</td>
              <td style="padding: 10px; color: #555;">${email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: bold; color: #333;">Phone Number</td>
              <td style="padding: 10px; color: #555;">${phoneNumber}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: bold; color: #333;">Company Name</td>
              <td style="padding: 10px; color: #555;">${companyName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: bold; color: #333;">Shipping Address</td>
              <td style="padding: 10px; color: #555;">${shippingAddress}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #333;">Date Limit</td>
              <td style="padding: 10px; color: #555;">${new Date(
                dateLimit
              ).toLocaleDateString()}</td>
            </tr>
          </table>
          ${
            pricedProductTable || disabledPriceProductTable
              ? '<h4 style="color: #555;">Order Details</h4>'
              : ""
          }
          ${pricedProductTable}
          ${disabledPriceProductTable}
          ${
            pricedItems.length > 0
              ? `
            <table style="width: 100%; border-collapse: collapse; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tfoot>
                <tr style="border-top: 2px solid #ddd;">
                  <td colspan="${
                    hasImages ? 5 : 4
                  }" style="padding: 12px; font-weight: bold; color: #333;">Subtotal</td>
                  <td style="padding: 12px; color: #555;">MAD ${pricedTotal.toFixed(
                    2
                  )}</td>
                </tr>
                <tr>
                  <td colspan="${
                    hasImages ? 5 : 4
                  }" style="padding: 12px; font-weight: bold; color: #333;">Discount</td>
                  <td style="padding: 12px; color: #ff0000;">-MAD ${pricedDiscount.toFixed(
                    2
                  )}</td>
                </tr>
                <tr>
                  <td colspan="${
                    hasImages ? 4 : 3
                  }" style="padding: 12px; font-weight: bold; color: #333;">Total</td>
                  <td style="padding: 12px; color: #007bff; font-weight: bold;">MAD ${(
                    pricedTotal - pricedDiscount
                  ).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          `
              : ""
          }
          <p style="text-align: center; color: #777; margin-top: 20px;">
            ${
              disabledPriceItems.length > 0
                ? "We will contact you shortly to confirm pricing for items marked 'Contact for Price'. "
                : ""
            }
            Thank you for your inquiry!
          </p>
        </div>
      `;


      // Send data to backend
      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          productTable,
        }),
      });

      if (response.ok) {
        setIsPopupOpen(false);
        setIsSuccessPopupOpen(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          companyName: "",
          shippingAddress: "",
          dateLimit: "",
        });
        setError("");
      } else {
        const errorData = await response.json();
        console.error("API error:", errorData);
        setError(errorData.message || "Failed to send order. Please try again.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        {cart && cart.items.length > 0 ? (
          <>
            <BreadcrumbCart />
            <h2
              className={cn([
                integralCF.className,
                "font-bold text-[32px] md:text-[40px] text-black uppercase mb-5 md:mb-6",
              ])}
            >
              Your Cart
            </h2>
            <div className="flex flex-col lg:flex-row space-y-5 lg:space-y-0 lg:space-x-5 items-start">
              <div className="w-full p-3.5 md:px-6 flex-col space-y-4 md:space-y-6 rounded-[20px] border border-black/10">
                {cart?.items.map((product, idx, arr) => (
                  <React.Fragment key={idx}>
                    <ProductCard data={product} />
                    {arr.length - 1 !== idx && (
                      <hr className="border-t-black/10" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="w-full lg:max-w-[505px] p-5 md:px-6 flex-col space-y-4 md:space-y-6 rounded-[20px] border border-black/10">
                <h6 className="text-xl md:text-2xl font-bold text-black">
                  Order Summary
                </h6>
                <div className="flex flex-col space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="md:text-xl text-black/60">Subtotal</span>
                    <span className="md:text-xl font-bold">
                      Starting from MAD {totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <hr className="border-t-black/10" />
                  <div className="flex items-center justify-between">
                    <span className="md:text-xl text-black">Total</span>
                    <span className="text-xl md:text-2xl font-bold">
                      Starting from MAD {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Text>
                      <MdOutlineLocalOffer className="text-black/40 text-2xl" />
                    </InputGroup.Text>
                    <InputGroup.Input
                      type="text"
                      name="code"
                      placeholder="Add promo code"
                      className="bg-transparent placeholder:text-black/40"
                    />
                  </InputGroup>
                  <Button
                    type="button"
                    className="bg-black rounded-full w-full max-w-[119px] h-[48px]"
                  >
                    Apply
                  </Button>
                </div>
                <Button
                  type="button"
                  className="text-sm md:text-base font-medium bg-black rounded-full w-full py-4 h-[54px] md:h-[60px] group"
                  onClick={() => setIsPopupOpen(true)}
                >
                  Go to Checkout{" "}
                  <FaArrowRight className="text-xl ml-2 group-hover:translate-x-1 transition-all" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center flex-col text-gray-300 mt-32">
            <TbBasketExclamation strokeWidth={1} className="text-6xl" />
            <span className="block mb-4">Your shopping cart is empty.</span>
            <Button className="rounded-full w-24" asChild>
              <Link href="/shop">Shop</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Checkout Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full my-8">
            <h3 className="text-xl font-bold mb-4">Enter Your Information</h3>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email address"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Company Name"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Shipping Address
                  </label>
                  <input
                    type="text"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="Shipping Address"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date Limit
                </label>
                <input
                  type="date"
                  name="dateLimit"
                  value={formData.dateLimit}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => setIsPopupOpen(false)}
                  className="bg-gray-300 text-black rounded-full"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-black text-white rounded-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Popup Modal */}
      {isSuccessPopupOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-10 rounded-2xl max-w-lg w-full text-center shadow-2xl transform transition-all duration-500 animate-popup">
            <div className="flex justify-center mb-4">
              <IoCheckmarkCircle className="text-6xl text-green-500 animate-checkmark" />
            </div>
            <h3 className="text-3xl font-bold text-green-600 mb-4 tracking-tight">
              Inquiry Sent!
            </h3>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Your order inquiry has been successfully submitted. We will contact you soon to confirm details${
                cart?.items.some((item) => item.disablePrice)
                  ? ", including pricing for items requiring confirmation"
                  : ""
              }. Thank you for choosing us!
            </p>
            <Button
              onClick={() => setIsSuccessPopupOpen(false)}
              className="bg-black text-white rounded-full px-8 py-3 hover:bg-gray-800 transition-colors"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}