import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/constants';

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

const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async headers => {
      try {
        const {
          default: AsyncStorage,
        } = require('@react-native-async-storage/async-storage');
        const token = await AsyncStorage.getItem('token');
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (error) {
        console.log('Token retrieval error:', error);
      }
      return headers;
    },
  }),
  tagTypes: ['Cart'],
  endpoints: builder => ({
    getCart: builder.query<CartItem[], void>({
      query: () => API_ENDPOINTS.CART.LIST,
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation<CartItem, AddToCartPayload>({
      query: cartData => ({
        url: API_ENDPOINTS.CART.ADD,
        method: 'POST',
        body: cartData,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartQuantity: builder.mutation<void, CartUpdatePayload>({
      query: ({ productId, quantity }) => ({
        url: API_ENDPOINTS.CART.UPDATE(productId),
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation<void, { productId: string }>({
      query: cartData => ({
        url: API_ENDPOINTS.CART.REMOVE(cartData.productId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
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
