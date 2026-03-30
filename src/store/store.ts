const createSagaMiddleware = require('redux-saga').default;

import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './rootReducer';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { persistReducer, persistStore } from 'redux-persist';
import sagas from './rootSaga';

const persistConfig = {
  key: 'root',

  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: persistedReducer,

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(sagas);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

const persistedStore = persistStore(store);

export { persistedStore, store };
