import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '../constants/constants';
import { baseQueryWithReauth } from './baseQuery';

export interface CartItem {
  _id: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

interface CartUpdatePayload {
  productId: string;
  quantity: number;
}

interface AddToCartPayload {
  productId: string;
  quantity: number;
}

interface CartItemsResponse {
  success?: boolean;
  items?: CartItem[];
  cart?: {
    items?: CartItem[];
  };
}

const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Cart'],
  endpoints: builder => ({
    getCart: builder.query<CartItem[], void>({
      query: () => API_ENDPOINTS.CART.LIST,
      providesTags: ['Cart'],
      transformResponse: (response: CartItemsResponse) =>
        response?.cart?.items || response?.items || [],
    }),
    addToCart: builder.mutation<CartItem[], AddToCartPayload>({
      query: cartData => ({
        url: API_ENDPOINTS.CART.ADD,
        method: 'POST',
        body: cartData,
      }),
      invalidatesTags: ['Cart'],
      transformResponse: (response: CartItemsResponse) => response?.items || [],
    }),
    updateCartQuantity: builder.mutation<CartItem[], CartUpdatePayload>({
      query: ({ productId, quantity }) => ({
        url: API_ENDPOINTS.CART.UPDATE(productId),
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
      transformResponse: (response: CartItemsResponse) => response?.items || [],
    }),
    removeFromCart: builder.mutation<CartItem[], { productId: string }>({
      query: cartData => ({
        url: API_ENDPOINTS.CART.REMOVE(cartData.productId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
      transformResponse: (response: CartItemsResponse) => response?.items || [],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartQuantityMutation,
  useRemoveFromCartMutation,
} = cartApi;
export default cartApi;
