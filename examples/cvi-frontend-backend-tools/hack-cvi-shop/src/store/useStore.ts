import { create } from "zustand";
import { PRODUCTS } from "./constants";

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  amount: number;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Category {
  name: string;
  icon: string;
  color: string;
}

interface StoreState {
  products: Product[];
  cart: CartItem[];
  selectedCategory: string;
  categories: Category[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateCartItemQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setSelectedCategory: (category: string) => void;
}

const categories: Category[] = [
  { name: "Clothing", icon: "Shirt", color: "bg-blue-100" },
  { name: "Shoes", icon: "Footprints", color: "bg-green-100" },
  { name: "Accessories", icon: "Watch", color: "bg-yellow-100" },
  { name: "Electronics", icon: "Smartphone", color: "bg-purple-100" },
  { name: "Home", icon: "Home", color: "bg-pink-100" },
  { name: "Beauty", icon: "Sparkles", color: "bg-orange-100" },
];

export const useStore = create<StoreState>((set) => ({
  products: PRODUCTS,
  cart: [],
  selectedCategory: "",
  categories,
  addToCart: (product) =>
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + 1, product.amount),
                }
              : item,
          ),
        };
      }
      return { cart: [...state.cart, { ...product, quantity: 1 }] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),
  updateCartItemQuantity: (productId, quantity) =>
    set((state) => ({
      cart: state.cart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: Math.max(0, Math.min(quantity, item.amount)),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    })),
  clearCart: () => set({ cart: [] }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
