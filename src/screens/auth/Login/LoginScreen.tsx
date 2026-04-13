import {
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  View,
  ActivityIndicator,
  Alert,
  Image,
  AppState,
  InteractionManager,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { styles } from './LoginStyles';
import { useForm, Controller } from 'react-hook-form';
import { useLoginMutation, type AuthApiError } from '../../../services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../../utils/colors';
import {
  API_BASE_URL,
  GOOGLE_WEB_CLIENT_ID,
} from '../../../constants/constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
} from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';
import {
  setAccessToken,
  setFirebaseUser,
  setRefreshToken,
} from '../../../slices/authSlice';
import {
  showWelcomeNotification,
  syncFcmTokenForCurrentUser,
} from '../../../services/notificationService';

interface LoginData {
  identifier: string;
}

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [requestOtp, { isLoading }] = useLoginMutation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const wait = (ms: number) =>
    new Promise<void>(resolve => setTimeout(() => resolve(), ms));

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { getApp } = await import('@react-native-firebase/app');
        getApp();
        console.log('[GoogleInit] Firebase app ready');
      } catch (e) {
        console.warn('[GoogleInit] Firebase check skipped:', e);
      }
      try {
        await GoogleSignin.configure({
          webClientId: GOOGLE_WEB_CLIENT_ID,
        });
        console.log('[GoogleInit] GoogleSignin configured');
      } catch (e) {
        console.error('[GoogleInit] Config error:', e);
      }
    };
    initAuth();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    defaultValues: {
      identifier: '',
    },
  });

  const parseIdentifier = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.includes('@')) {
      return { type: 'email' as const, email: trimmed.toLowerCase() };
    }
    const phone = trimmed.replace(/[^\d+]/g, '');
    return { type: 'phone' as const, phone };
  };

  const onSubmit = async (data: LoginData) => {
    try {
      const trimmedIdentifier = data.identifier.trim();
      const payload = parseIdentifier(trimmedIdentifier);

      if (!(payload as any).email && !(payload as any).phone) {
        Alert.alert('Error', 'Email or phone cannot be empty');
        return;
      }

      if (payload.type === 'phone') {
        const response: any = await requestOtp({
          phone: payload.phone,
        }).unwrap();
        Alert.alert('Success', response?.message || 'OTP sent successfully');
        navigation.navigate('otpScreen', {
          identifier: payload.phone || trimmedIdentifier,
          authMode: 'backend',
        });
        return;
      }

      const response: any = await requestOtp({ email: payload.email }).unwrap();
      Alert.alert('Success', response?.message || 'OTP sent successfully');
      navigation.navigate('otpScreen', {
        identifier: payload.email || trimmedIdentifier,
        authMode: 'backend',
      });
    } catch (err: any) {
      const apiError = err?.data as AuthApiError | undefined;
      if (apiError?.shouldRegister) {
        Alert.alert('Register Required', apiError.message || 'Please register');
        navigation.replace('registerScreen', {
          prefillEmail: apiError?.prefill?.email || '',
          prefillPhone: apiError?.prefill?.phone || '',
        });
        return;
      }
      Alert.alert('Error', err?.data?.message || 'Failed to send OTP');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      console.log('[GoogleLogin] Start button pressed');
      if (AppState.currentState !== 'active') {
        throw new Error(
          'App is not active. Try again after app is foreground.',
        );
      }
      // Ensure activity/screen interactions are ready before presenting Google UI.
      await new Promise<void>(resolve => {
        InteractionManager.runAfterInteractions(() => resolve());
      });
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log('[GoogleLogin] Play Services available');

      // Force chooser: clear previous Google session so SDK does not auto-select last account.
      try {
        await GoogleSignin.revokeAccess();
        console.log(
          '[GoogleLogin] revokeAccess success (previous grant cleared)',
        );
      } catch (revokeErr: any) {
        console.log('[GoogleLogin] revokeAccess skipped/failed', {
          code: revokeErr?.code,
          message: revokeErr?.message,
        });
      }
      try {
        await GoogleSignin.signOut();
        console.log('[GoogleLogin] signOut success (cached account cleared)');
      } catch (signOutErr: any) {
        console.log('[GoogleLogin] signOut skipped/failed', {
          code: signOutErr?.code,
          message: signOutErr?.message,
        });
      }

      console.log('[GoogleLogin] Opening Google account chooser modal...');
      let signInResult: any;
      const MAX_NULL_PRESENTER_RETRIES = 5;
      for (
        let attempt = 1;
        attempt <= MAX_NULL_PRESENTER_RETRIES;
        attempt += 1
      ) {
        try {
          if (AppState.currentState !== 'active') {
            console.log('[GoogleLogin] Waiting for app active...');
            await new Promise(resolve => {
              const sub = AppState.addEventListener('change', nextState => {
                if (nextState === 'active') {
                  sub?.remove();
                  resolve(undefined);
                }
              });
            });
          }
          await new Promise<void>(resolve => {
            InteractionManager.runAfterInteractions(() => resolve());
          });
          signInResult = await GoogleSignin.signIn();
          break;
        } catch (signInErr: any) {
          const signInCode = `${signInErr?.code || ''}`;
          const isNullPresenter =
            signInCode === 'NULL_PRESENTER' ||
            signInCode.includes('NULL_PRESENTER');
          if (!isNullPresenter || attempt === MAX_NULL_PRESENTER_RETRIES) {
            throw signInErr;
          }
          console.warn('[GoogleLogin] NULL_PRESENTER retry', {
            attempt,
            max: MAX_NULL_PRESENTER_RETRIES,
          });
          await wait(600 * attempt);
        }
      }
      const selectedAccount =
        signInResult?.data?.user ||
        signInResult?.user ||
        signInResult?.data ||
        undefined;
      console.log('[GoogleLogin] signInResult received', {
        hasDataToken: Boolean(signInResult?.data?.idToken),
        hasLegacyToken: Boolean(signInResult?.idToken),
        selectedEmail: selectedAccount?.email || 'unknown',
        selectedName: selectedAccount?.name || 'unknown',
      });
      console.log(
        '[GoogleLogin] If signInResult received, chooser modal closed and user tapped continue/select account',
      );
      const googleIdToken =
        signInResult?.data?.idToken || signInResult?.idToken;

      if (!googleIdToken) throw new Error('No ID token found');
      console.log('[GoogleLogin] ID token resolved');

      const googleCredential = GoogleAuthProvider.credential(googleIdToken);
      console.log('[GoogleLogin] Firebase credential created');
      const credentialResult = await signInWithCredential(
        getAuth(),
        googleCredential,
      );
      console.log('[GoogleLogin] Firebase signInWithCredential success');
      const firebaseUser = credentialResult.user;
      const displayName = firebaseUser.displayName || '';
      const [firstName = 'Google', ...rest] = displayName.split(' ');
      const lastName = rest.join(' ') || 'User';

      // Step 1: Firebase sign-in succeeded; now exchange identity with backend.
      await firebaseUser.getIdToken(true);
      console.log('[GoogleLogin] Firebase ID token refreshed');
      console.log('[GoogleLogin] Requesting backend JWT for Google user...');
      const backendLoginResponse = await fetch(
        `${API_BASE_URL}/api/auth/google-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: firebaseUser.email || '',
            firstName,
            lastName,
          }),
        },
      );
      const backendLoginData = await backendLoginResponse
        .json()
        .catch(() => ({}));
      if (!backendLoginResponse.ok) {
        console.warn('[GoogleLogin] Backend google-login failed', {
          status: backendLoginResponse.status,
          message: backendLoginData?.message,
        });
        try {
          await getAuth().signOut();
        } catch {}
        try {
          await GoogleSignin.signOut();
        } catch {}
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userVerified');
        await AsyncStorage.removeItem('refreshToken');
        if (backendLoginData?.shouldRegister) {
          Alert.alert(
            'Register Required',
            backendLoginData?.message || 'Please register first.',
          );
          navigation.replace('registerScreen', {
            prefillEmail:
              backendLoginData?.prefill?.email || firebaseUser.email || '',
            prefillFirstName: backendLoginData?.prefill?.firstName || firstName,
            prefillLastName: backendLoginData?.prefill?.lastName || lastName,
            prefillPhone: '',
          });
          return;
        }
        throw new Error(
          backendLoginData?.message ||
            'Google sign-in success hua, lekin backend login failed.',
        );
      }
      const accessToken = backendLoginData?.accessToken;
      const refreshToken = backendLoginData?.refreshToken;
      const backendUser = backendLoginData?.user;
      if (!accessToken || !refreshToken || !backendUser) {
        throw new Error('Backend token response invalid for Google login');
      }
      console.log('[GoogleLogin] Backend JWT issued successfully');
      await AsyncStorage.setItem('token', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      dispatch(
        setFirebaseUser({
          uid: backendUser.uid,
          email: backendUser.email || firebaseUser.email || '',
          firstName: backendUser.firstName || firstName,
          lastName: backendUser.lastName || lastName,
        }),
      );
      dispatch(setAccessToken(accessToken));
      dispatch(setRefreshToken(refreshToken));

      try {
        await syncFcmTokenForCurrentUser();
      } catch (fcmErr: any) {
        console.warn('[GoogleLogin] FCM token sync skipped (non-blocking)', {
          code: fcmErr?.code,
          message: fcmErr?.message,
        });
      }
      await AsyncStorage.setItem('userVerified', 'true');
      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
      try {
        await showWelcomeNotification(fullName || 'User');
      } catch (notificationErr: any) {
        console.warn(
          '[GoogleLogin] Welcome notification skipped (non-blocking)',
          {
            code: notificationErr?.code,
            message: notificationErr?.message,
          },
        );
      }
      console.log('[GoogleLogin] Login flow completed successfully');
      Alert.alert('Success', 'Logged in with Google!');
      navigation.replace('MainDrawer');
    } catch (error: any) {
      console.error('[GoogleLogin] Failed', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
      });
      const errorCode = `${error?.code || ''}`;
      if (
        errorCode === 'SIGN_IN_CANCELLED' ||
        errorCode === '12501' ||
        errorCode.includes('SIGN_IN_CANCELLED')
      ) {
        console.log(
          '[GoogleLogin] User cancelled chooser/continue step before completing sign-in',
        );
        return;
      }
      if (errorCode === 'IN_PROGRESS' || errorCode.includes('IN_PROGRESS'))
        return;
      if (
        errorCode === 'PLAY_SERVICES_NOT_AVAILABLE' ||
        errorCode.includes('PLAY_SERVICES_NOT_AVAILABLE')
      ) {
        Alert.alert('Error', 'Google Play Services not available');
        return;
      }
      if (errorCode === '12500' || errorCode.includes('12500')) {
        Alert.alert(
          'Google Sign-In Config Error',
          'Google login setup mismatch (code 12500). Check package name, SHA-1/SHA-256 in Firebase, correct Android OAuth client, and webClientId. Then download new google-services.json and rebuild app.',
        );
        return;
      }

      Alert.alert('Error', error?.message || 'Google login failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <View style={styles.avoidContainer}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerText}>
          Welcome Back{'\n'}
          {}
        </Text>

        <Controller
          control={control}
          name="identifier"
          rules={{
            required: 'Email or phone is required',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.identifier && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.identifier && (
          <Text style={styles.errorText}>{errors.identifier.message}</Text>
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Send OTP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.googleBtn]}
          onPress={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <View style={styles.googleBtnContent}>
              <Image
                source={require('../../../assets/google.png')}
                style={styles.googleLogo}
              />
              <Text style={styles.googleBtnText}>Sign in with Google</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.replace('registerScreen')}
          style={styles.new}
        >
          <Text style={styles.text1}>New here? Go to Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.replace('MainDrawer')}
          style={styles.homeLink}
        >
          <Text style={styles.homeText}>Go to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;
