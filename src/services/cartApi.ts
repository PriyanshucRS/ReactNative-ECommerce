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
  data?: {
    items?: CartItem[];
    cart?: {
      items?: CartItem[];
    };
  };
}

const extractCartItems = (response: CartItemsResponse | CartItem[] | undefined) => {
  if (Array.isArray(response)) return response;
  if (!response) return [];
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.cart?.items)) return response.cart.items;
  if (Array.isArray(response.data?.items)) return response.data.items;
  if (Array.isArray(response.data?.cart?.items)) return response.data.cart.items;
  return [];
};

const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Cart'],
  endpoints: builder => ({
    getCart: builder.query<CartItem[], void>({
      query: () => API_ENDPOINTS.CART.LIST,
      providesTags: ['Cart'],
      transformResponse: (response: CartItemsResponse) => extractCartItems(response),
    }),
    addToCart: builder.mutation<CartItem[], AddToCartPayload>({
      query: cartData => ({
        url: API_ENDPOINTS.CART.ADD,
        method: 'POST',
        body: cartData,
      }),
      invalidatesTags: ['Cart'],
      transformResponse: (response: CartItemsResponse) => extractCartItems(response),
    }),
    updateCartQuantity: builder.mutation<CartItem[], CartUpdatePayload>({
      query: ({ productId, quantity }) => ({
        url: API_ENDPOINTS.CART.UPDATE(productId),
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
      transformResponse: (response: CartItemsResponse) => extractCartItems(response),
    }),
    removeFromCart: builder.mutation<CartItem[], { productId: string }>({
      query: cartData => ({
        url: API_ENDPOINTS.CART.REMOVE(cartData.productId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
      transformResponse: (response: CartItemsResponse) => extractCartItems(response),
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
