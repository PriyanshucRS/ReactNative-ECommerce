import { put, call, takeLatest } from 'redux-saga/effects';
import { apiClient } from '../../services/http';
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
} from '../slices/authSlice';

function* loginSaga(action: any) {
  try {
    const { email, password } = action.payload;
    const response = yield call(apiClient.post, '/auth/login', {
      email,
      password,
    });
    console.log('Login response:', response.data);
    yield put(loginSuccess(response.data));
  } catch (error: any) {
    yield put(loginFailure(error.response?.data?.message || 'Login failed'));
  }
}

function* registerSaga(action: any) {
  try {
    const payload = action.payload;

    const response = yield call(apiClient.post, '/auth/register', payload);

    yield put(registerSuccess(response.data.user || response.data));
  } catch (error: any) {
    yield put(
      registerFailure(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          'Registration failed',
      ),
    );
  }
}
export function* watchAuthSaga() {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(registerRequest.type, registerSaga);
}
