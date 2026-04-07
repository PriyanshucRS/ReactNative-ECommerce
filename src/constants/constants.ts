export const IP_ADDRESS = '10.0.2.2';
export const BACKEND_PORT = 5000;
export const NGROK_URL = 'https://unfertilizing-lilla-unlamed.ngrok-free.dev';
export const USE_NGROK = true;
export const API_BASE_URL = USE_NGROK
  ? NGROK_URL
  : `http://${IP_ADDRESS}:${BACKEND_PORT}`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  PRODUCTS: {
    LIST: '/api/products',
    CREATE: '/api/products',
    USER: '/api/products/user',
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
} as const;
