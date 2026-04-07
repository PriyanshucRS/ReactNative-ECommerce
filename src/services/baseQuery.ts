import { fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/constants';
import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    const reduxToken = (getState() as RootState).auth.accessToken;
    let token = reduxToken;

    if (!token) {
      try {
        token = await AsyncStorage.getItem('token');
      } catch {
        // Ignore storage read errors and continue without token.
      }
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn = async (
  args,
  api,
  extraOptions,
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    if (refreshToken) {
      const refreshArgs: FetchArgs = {
        url: '/api/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      };
      const refreshResult = (await baseQuery(
        refreshArgs,
        api,
        extraOptions,
      )) as { data?: { accessToken?: string; refreshToken?: string }; error?: FetchBaseQueryError };

      if (refreshResult.data) {
        const newAccessToken = refreshResult.data.accessToken;
        const newRefreshToken = refreshResult.data.refreshToken;
        if (!newAccessToken) {
          api.dispatch({ type: 'auth/signout' });
          await AsyncStorage.clear();
          return result;
        }
        api.dispatch({
          type: 'auth/setAccessToken',
          payload: newAccessToken,
        });
        if (newRefreshToken) {
          api.dispatch({
            type: 'auth/setRefreshToken',
            payload: newRefreshToken,
          });
        }
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch({ type: 'auth/signout' });
        await AsyncStorage.clear();
      }
    } else {
      api.dispatch({ type: 'auth/signout' });
      await AsyncStorage.clear();
    }
  }
  return result;
};
