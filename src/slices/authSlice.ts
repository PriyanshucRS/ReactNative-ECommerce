import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../services/api';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUser: state => {
      state.user = null;
    },
  },
  extraReducers: builder => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.user = (action.payload as any).user;
      })
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, action) => {
          state.user = (action.payload as any).user;
        },
      );
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
