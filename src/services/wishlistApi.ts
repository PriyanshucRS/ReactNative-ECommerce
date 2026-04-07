import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '../constants/constants';
import { baseQueryWithReauth } from './baseQuery';

export interface Product {
  id?: string;
  _id: string;
  productId?: string;
  title?: string;
  name?: string;
  image: string;
  category: string;
  description: string;
  price: number;
}

interface TogglePayload {
  productId: string;
}

interface ToggleResponse {
  success: boolean;
  items: Product[];
}

interface WishlistResponse {
  success?: boolean;
  items?: Product[];
  wishlist?: {
    items?: Product[];
  };
}

const wishlistApi = createApi({
  reducerPath: 'wishlistApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Wishlist'],
  endpoints: builder => ({
    getWishlist: builder.query<Product[], void>({
      query: () => API_ENDPOINTS.WISHLIST.LIST,
      providesTags: ['Wishlist'],
      transformResponse: (response: WishlistResponse) =>
        response?.wishlist?.items || response?.items || [],
    }),
    toggleWishlist: builder.mutation<ToggleResponse, TogglePayload>({
      query: ({ productId }) => ({
        url: API_ENDPOINTS.WISHLIST.TOGGLE,
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['Wishlist'],
      transformResponse: (response: WishlistResponse) => ({
        success: !!response?.success,
        items: response?.items || [],
      }),
    }),
  }),
});

export const { useGetWishlistQuery, useToggleWishlistMutation } = wishlistApi;
export default wishlistApi;
