import { all } from 'redux-saga/effects';
import { watchAuthSaga } from './sagas/authSaga';
import { watchAddProduct, watchFetchProducts } from './sagas/addProductSaga';
import {
  watchAddToCart,
  watchFetchCart,
  watchUpdateQuantity,
  watchRemoveFromCart,
} from './sagas/cartSaga';

export default function* rootSaga() {
  yield all([
    watchAuthSaga(),
    watchAddProduct(),
    watchFetchProducts(),
    watchAddToCart(),
    watchFetchCart(),
    watchUpdateQuantity(),
    watchRemoveFromCart(),
  ]);
}
