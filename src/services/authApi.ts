import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/constants';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

const authApi = createApi({
  reducerPath: 'authApi',
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
  tagTypes: ['Auth'],
  endpoints: builder => ({
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: credentials => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: userData => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
export default authApi;
