import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/http';
import {
  addProductStart,
  addProductSuccess,
  addProductFailure,
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
} from '../slices/addProductSlice';

interface AddProductPayload {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

function* addProductSaga(action: PayloadAction<AddProductPayload>) {
  try {
    const response = yield call(apiClient.post, '/products', action.payload);
    yield put(addProductSuccess(response.data));
  } catch (error: any) {
    const errorMsg =
      error.response?.data?.message || error.message || 'Failed to add product';
    yield put(addProductFailure(errorMsg));
  }
}

function* fetchProductsSaga() {
  try {
    const response = yield call(apiClient.get, '/products');

    yield put(fetchProductsSuccess(response.data));
  } catch (error: any) {
    yield put(
      fetchProductsFailure(
        error.response?.data?.message || 'Failed to fetch products',
      ),
    );
  }
}

export function* watchAddProduct() {
  yield takeLatest(addProductStart.type, addProductSaga);
}

export function* watchFetchProducts() {
  yield takeLatest(fetchProductsStart.type, fetchProductsSaga);
}
