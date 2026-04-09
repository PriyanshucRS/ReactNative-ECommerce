import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '../constants/constants';
import { baseQueryWithReauth } from './baseQuery';

interface LoginPayload {
  email?: string;
  phone?: string;
}

interface RegisterPayload {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

export interface User {
  uid?: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface LogoutResponse {
  message: string;
}

interface BasicResponse {
  message: string;
  shouldRegister?: boolean;
  prefill?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface AuthPrefill {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthApiError {
  message: string;
  shouldRegister?: boolean;
  prefill?: AuthPrefill;
}

const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth'],
  endpoints: builder => ({
    login: builder.mutation<BasicResponse, LoginPayload>({
      // This endpoint now sends OTP to email/phone.
      query: credentials => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    verifyOtp: builder.mutation<
      AuthResponse,
      { email?: string; phone?: string; otp: string }
    >({
      query: payload => ({
        url: API_ENDPOINTS.AUTH.VERIFY_OTP,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<BasicResponse, RegisterPayload>({
      query: userData => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyOtpMutation,
  useRegisterMutation,
  useLogoutMutation,
} = authApi;
export default authApi;
