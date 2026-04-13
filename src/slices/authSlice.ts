import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../services/api';
import type { AuthResponse } from '../services/authApi';

export interface User {
  uid?: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const applyAuthPayload = (state: AuthState, payload: AuthResponse) => {
  state.user = payload.user;
  state.accessToken = payload.accessToken;
  state.refreshToken = payload.refreshToken;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload;
    },
    setFirebaseUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    signout: state => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
  extraReducers: builder => {
    builder
      .addMatcher(
        authApi.endpoints.verifyOtp.matchFulfilled,
        (state, action) => {
          applyAuthPayload(state, action.payload as AuthResponse);
        },
      )
      .addMatcher(authApi.endpoints.logout.matchFulfilled, state => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });
  },
});

export const { setAccessToken, setRefreshToken, setFirebaseUser, signout } =
  authSlice.actions;
export default authSlice.reducer;
