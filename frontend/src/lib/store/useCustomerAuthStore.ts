import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CustomerAddress {
  _id: string;
  recipientName: string;
  phoneNumber: string;
  addressString: string;
  isDefault: boolean;
}

interface CustomerInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  profilePic?: string;
  phone?: string;
  address?: string;
  addresses?: CustomerAddress[];
  favorites?: any[]; // Array of populated products or just ObjectIds
}

interface CustomerAuthState {
  customerInfo: CustomerInfo | null;
  setCustomerInfo: (info: CustomerInfo) => void;
  logout: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set) => ({
      customerInfo: null,
      setCustomerInfo: (info) => set({ customerInfo: info }),
      logout: () => set({ customerInfo: null }),
    }),
    {
      name: 'customer-auth-storage', // unique name for storefront customers
      storage: createJSONStorage(() => localStorage),
    }
  )
);
