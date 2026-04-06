// Re-export all APIs for backward compatibility
export * from './authApi';
export * from './productsApi';
export * from './cartApi';

// Named exports for slice sync (extraReducers)
export { default as authApi } from './authApi';
export { default as productsApi } from './productsApi';
export { default as cartApi } from './cartApi';
