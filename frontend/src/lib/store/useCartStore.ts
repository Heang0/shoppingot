import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  cartItemId: string; // Composite key: productId + variants
  productId: string;
  title: string;
  titleKm?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  selectedVariants?: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  isDrawerOpen: boolean;
  setDrawerOpen: (isOpen: boolean) => void;
}

// Helper to generate a unique ID for a cart item based on its variants
const generateCartItemId = (productId: string, variants?: Record<string, string>) => {
  if (!variants || Object.keys(variants).length === 0) return productId;
  // Sort keys to ensure consistent IDs regardless of object key order
  const variantString = Object.keys(variants)
    .sort()
    .map((k) => `${k}:${variants[k]}`)
    .join('-');
  return `${productId}-${variantString}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      isDrawerOpen: false,
      setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      addItem: (item) => {
        const items = get().items;
        const cartItemId = generateCartItemId(item.productId, item.selectedVariants);
        const existingItem = items.find((i) => i.cartItemId === cartItemId);
        
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, cartItemId }] });
        }
      },
      removeItem: (cartItemId) => {
        set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) });
      },
      updateQuantity: (cartItemId, quantity) => {
        set({
          items: get().items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
