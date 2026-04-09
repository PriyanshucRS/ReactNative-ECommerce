import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '../constants/constants';
import { baseQueryWithReauth } from './baseQuery';

export interface Product {
  id?: string;
  _id?: string;
  userId?: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

interface AddProductPayload {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

interface ProductsListResponse {
  success: boolean;
  products: Product[];
}

interface ProductResponse {
  success: boolean;
  product: Product;
}

interface DeleteProductResponse {
  success: boolean;
  message: string;
}

const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Products'],
  endpoints: builder => ({
    getProducts: builder.query<
      Product[],
      { category?: string; maxPrice?: number } | undefined
    >({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (
          typeof filters.maxPrice === 'number' &&
          Number.isFinite(filters.maxPrice) &&
          filters.maxPrice > 0
        ) {
          params.append('maxPrice', String(filters.maxPrice));
        }
        return `${API_ENDPOINTS.PRODUCTS.LIST}${
          params.toString() ? `?${params}` : ''
        }`;
      },
      providesTags: () => [{ type: 'Products', id: 'LIST' }],
      transformResponse: (response: ProductsListResponse) =>
        response.products || [],
    }),

    getUserProducts: builder.query<Product[], void>({
      query: () => API_ENDPOINTS.PRODUCTS.USER,
      providesTags: () => [{ type: 'Products', id: 'USER_LIST' }],
      transformResponse: (response: ProductsListResponse) =>
        response.products || [],
    }),

    getProductById: builder.query<Product, string>({
      query: id => `${API_ENDPOINTS.PRODUCTS.LIST}/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Products', id }],
      transformResponse: (response: ProductResponse) => response.product,
    }),

    addProduct: builder.mutation<Product, AddProductPayload>({
      query: productData => ({
        url: API_ENDPOINTS.PRODUCTS.CREATE,
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: [
        { type: 'Products', id: 'LIST' },
        { type: 'Products', id: 'USER_LIST' },
      ],
      transformResponse: (response: ProductResponse) => response.product,
    }),
    updateProduct: builder.mutation<
      Product,
      { id: string; data: AddProductPayload }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.PRODUCTS.UPDATE(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Products', id: 'LIST' },
        { type: 'Products', id: 'USER_LIST' },
        { type: 'Products', id: arg.id },
      ],
      transformResponse: (response: ProductResponse) => response.product,
    }),
    deleteProduct: builder.mutation<DeleteProductResponse, string>({
      query: id => ({
        url: API_ENDPOINTS.PRODUCTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Products', id: 'LIST' },
        { type: 'Products', id: 'USER_LIST' },
        { type: 'Products', id },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
} = productsApi;
export default productsApi;
