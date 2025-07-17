import { compareArrays } from '@/lib/utils';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Helper function to calculate adjusted total price
const calcAdjustedTotalPrice = (
  data: CartItem,
  quantity?: number
): number => {
  const price = data.price;
  // Since we removed discount, just use the regular price
  return price * (quantity ? quantity : data.quantity);
};

// Helper function to update cart totals
const updateCartTotals = (
  state: CartsState,
  item: CartItem,
  quantityChange: number
) => {
  state.totalPrice += item.price * quantityChange;
  state.adjustedTotalPrice += calcAdjustedTotalPrice(item, quantityChange);
};

// Types
export type RemoveCartItem = {
  id: string; // Changed to string
  attributes: string[];
};

export type CartItem = {
  id: string; // Changed to string
  name: string;
  srcUrl: string;
  price: number;
  attributes: string[];
  quantity: number;
  disablePrice?: boolean;
};

export type Cart = {
  items: CartItem[];
  totalQuantities: number;
};

// Slice state
interface CartsState {
  cart: Cart;
  totalPrice: number;
  adjustedTotalPrice: number;
  action: 'update' | 'add' | 'delete' | null;
}

// Initial state
const initialState: CartsState = {
  cart: { items: [], totalQuantities: 0 },
  totalPrice: 0,
  adjustedTotalPrice: 0,
  action: null,
};

// Slice
export const cartsSlice = createSlice({
  name: 'carts',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { payload: item } = action;

      // Check if item already exists in the cart
      const isItemInCart = state.cart.items.find(
        (cartItem) =>
          cartItem.id === item.id &&
          compareArrays(cartItem.attributes, item.attributes)
      );

      if (isItemInCart) {
        // Update quantity if item exists
        state.cart.items = state.cart.items.map((cartItem) =>
          cartItem.id === item.id &&
          compareArrays(cartItem.attributes, item.attributes)
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      } else {
        // Add new item to cart
        state.cart.items.push(item);
      }

      // Update totals
      state.cart.totalQuantities += item.quantity;
      updateCartTotals(state, item, item.quantity);
    },
    removeCartItem: (state, action: PayloadAction<RemoveCartItem>) => {
      const { payload: itemToRemove } = action;

      // Find the item in the cart
      const isItemInCart = state.cart.items.find(
        (cartItem) =>
          cartItem.id === itemToRemove.id &&
          compareArrays(cartItem.attributes, itemToRemove.attributes)
      );

      if (isItemInCart) {
        // Decrease quantity by 1
        state.cart.items = state.cart.items
          .map((cartItem) =>
            cartItem.id === itemToRemove.id &&
            compareArrays(cartItem.attributes, itemToRemove.attributes)
              ? { ...cartItem, quantity: cartItem.quantity - 1 }
              : cartItem
          )
          .filter((cartItem) => cartItem.quantity > 0);

        // Update totals
        state.cart.totalQuantities -= 1;
        updateCartTotals(state, isItemInCart, -1);
      }
    },
    remove: (
      state,
      action: PayloadAction<RemoveCartItem & { quantity: number }>
    ) => {
      const { payload: itemToRemove } = action;

      // Find the item in the cart
      const isItemInCart = state.cart.items.find(
        (cartItem) =>
          cartItem.id === itemToRemove.id &&
          compareArrays(cartItem.attributes, itemToRemove.attributes)
      );

      if (isItemInCart) {
        // Remove the item completely
        state.cart.items = state.cart.items.filter(
          (cartItem) =>
            !(
              cartItem.id === itemToRemove.id &&
              compareArrays(cartItem.attributes, itemToRemove.attributes)
            )
        );

        // Update totals
        state.cart.totalQuantities -= isItemInCart.quantity;
        updateCartTotals(state, isItemInCart, -isItemInCart.quantity);
      }
    },
  },
});

// Export actions
export const { addToCart, removeCartItem, remove } = cartsSlice.actions;

// Export reducer
export default cartsSlice.reducer;