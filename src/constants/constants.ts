// export const API_BASE_URL = 'http://192.0.0.2:5000/api';
export const API_BASE_URL =
  'https://unfertilizing-lilla-unlamed.ngrok-free.dev/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
  },
  CART: {
    LIST: '/cart',
    ADD: '/cart/add',
    UPDATE: (id: string) => `/cart/${id}`,
    REMOVE: (id: string) => `/cart/${id}`,
  },
} as const;

export const IP_ADDRESS = 'localhost';
export const BACKEND_PORT = 5000;
