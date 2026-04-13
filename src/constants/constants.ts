export const IP_ADDRESS = '10.0.2.2';
export const BACKEND_PORT = 5000;
export const NGROK_URL = 'https://unfertilizing-lilla-unlamed.ngrok-free.dev';
export const USE_NGROK = true;
export const API_BASE_URL = USE_NGROK
  ? NGROK_URL
  : `http://${IP_ADDRESS}:${BACKEND_PORT}`;

export const GOOGLE_WEB_CLIENT_ID =
  '542544581166-fs5s122bd1pq07v8arg7dsg47rdmpuvg.apps.googleusercontent.com';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    VERIFY_OTP: '/api/auth/verify-otp',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  PRODUCTS: {
    LIST: '/api/products',
    CREATE: '/api/products',
    USER: '/api/products/user',
    UPDATE: (id: string) => `/api/products/${id}`,
    DELETE: (id: string) => `/api/products/${id}`,
  },
  WISHLIST: {
    LIST: '/api/watchlist',
    TOGGLE: '/api/watchlist/toggle',
  },
  CART: {
    LIST: '/api/cart',
    ADD: '/api/cart/add',
    UPDATE: (id: string) => `/api/cart/${id}`,
    REMOVE: (id: string) => `/api/cart/${id}`,
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    CREATE: '/api/notifications',
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    DELETE_ONE: (id: string) => `/api/notifications/${id}`,
    CLEAR_ALL: '/api/notifications/clear-all/all',
    DELETE_SELECTED: '/api/notifications/delete-selected',
  },
} as const;
