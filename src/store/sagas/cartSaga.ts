import {
  call,
  put,
  takeLatest,
  CallEffect,
  PutEffect,
} from 'redux-saga/effects';
import { apiClient } from '../../services/http';
import {
  addToCartStart,
  addToCartSuccess,
  addToCartFailure,
  fetchCartStart,
  fetchCartSuccess,
  fetchCartFailure,
  updateQuantityStart,
  updateQuantitySuccess,
  updateQuantityFailure,
  removeFromCartStart,
  removeFromCartSuccess,
  removeFromCartFailure,
} from '../slices/cartSlice';

interface ActionPayload {
  type: string;
  payload: any;
}

function* addToCartSaga(
  action: ActionPayload,
): Generator<CallEffect | PutEffect, void, any> {
  try {
    console.log('🛒 Cart saga - adding:', action.payload);
    const response: any = yield call(apiClient.post, '/cart/add', {
      productId: action.payload._id || action.payload.id,
      quantity: 1,
    });
    yield put(addToCartSuccess(response.data));
  } catch (error: any) {
    console.error('🛒 Cart saga error:', error);
    yield put(
      addToCartFailure(error.response?.data?.message || 'Add to cart failed'),
    );
  }
}

function* fetchCartSaga(): Generator<CallEffect | PutEffect, void, any> {
  try {
    const response: any = yield call(apiClient.get, '/cart');
    yield put(fetchCartSuccess(response.data));
  } catch (error: any) {
    console.error('Fetch cart error:', error);
    yield put(
      fetchCartFailure(error.response?.data?.message || 'Fetch cart failed'),
    );
  }
}

function* updateQuantitySaga(
  action: ActionPayload,
): Generator<CallEffect | PutEffect, void, any> {
  try {
    const response: any = yield call(
      apiClient.post,
      '/cart/update',
      action.payload,
    );
    yield put(updateQuantitySuccess(response.data));
  } catch (error: any) {
    console.error('Update quantity error:', error);
    yield put(
      updateQuantityFailure(error.response?.data?.message || 'Update failed'),
    );
  }
}
function* removeFromCartSaga(
  action: ActionPayload,
): Generator<CallEffect | PutEffect, void, any> {
  try {
    const { productId } = action.payload;

    yield call(apiClient.delete, `/cart/remove/${productId}`);

    yield put(removeFromCartSuccess({ productId }));
  } catch (error: any) {
    console.error('Remove from cart error:', error);
    yield put(
      removeFromCartFailure(error.response?.data?.message || 'Remove failed'),
    );
  }
}

export function* watchAddToCart() {
  yield takeLatest(addToCartStart.type, addToCartSaga);
}

export function* watchFetchCart() {
  yield takeLatest(fetchCartStart.type, fetchCartSaga);
}

export function* watchUpdateQuantity() {
  yield takeLatest(updateQuantityStart.type, updateQuantitySaga);
}

export function* watchRemoveFromCart() {
  yield takeLatest(removeFromCartStart.type, removeFromCartSaga);
}
