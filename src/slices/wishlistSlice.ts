import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store/store';

interface WishlistState {
  favorites: string[];
}

const initialState: WishlistState = {
  favorites: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleFavorite: (state, action) => {
      const id = action.payload;
      const index = state.favorites.indexOf(id);
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(id);
      }
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
  },
});

export const { toggleFavorite, setFavorites } = wishlistSlice.actions;
export default wishlistSlice.reducer;

export const selectFavorites = (state: RootState) => state.wishlist.favorites;
