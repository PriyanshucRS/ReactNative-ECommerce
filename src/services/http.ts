import axios from 'axios';

import { store } from '../store/store';

export const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

apiClient.interceptors.request.use(
  config => {
    const {
      auth: { token },
    } = store.getState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  error => Promise.reject(error),
);
