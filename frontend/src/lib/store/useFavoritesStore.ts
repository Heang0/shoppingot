import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteItem {
  productId: string;
}

interface FavoritesStore {
  favorites: FavoriteItem[];
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (productId: string) => {
        const { favorites } = get();
        if (!favorites.some(f => f.productId === productId)) {
          set({ favorites: [...favorites, { productId }] });
        }
      },

      removeFavorite: (productId: string) => {
        const { favorites } = get();
        set({ favorites: favorites.filter(f => f.productId !== productId) });
      },

      isFavorite: (productId: string) => {
        const { favorites } = get();
        return favorites.some(f => f.productId === productId);
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'favorites-store',
    }
  )
);
