import {
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  View,
  ActivityIndicator,
  Alert,
  NativeModules,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { styles } from './LoginStyles';
import { useForm, Controller } from 'react-hook-form';
import { useLoginMutation, type AuthApiError } from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../../utils/colors';
import { GOOGLE_WEB_CLIENT_ID } from '../../../constants/constants';
import auth from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';
import { setFirebaseUser } from '../../../slices/authSlice';
interface LoginData {
  identifier: string;
}

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [requestOtp, { isLoading }] = useLoginMutation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleSigninLib, setGoogleSigninLib] = useState<any>(null);

  useEffect(() => {
    // Prevent crash when native module is not yet in installed binary.
    if (!NativeModules?.RNGoogleSignin) {
      setGoogleSigninLib(null);
      return;
    }

    try {
      const mod = require('@react-native-google-signin/google-signin');
      mod.GoogleSignin.configure({
        scopes: ['email', 'profile'],
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
      setGoogleSigninLib(mod);
    } catch {
      setGoogleSigninLib(null);
    }
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

  const normalizePhoneForFirebase = (rawPhone: string) => {
    const cleaned = rawPhone.trim().replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    const digitsOnly = cleaned.replace(/[^\d]/g, '');
    if (digitsOnly.length === 10) {
      return `+91${digitsOnly}`;
    }
    if (digitsOnly.length > 10) {
      return `+${digitsOnly}`;
    }
    return '';
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
        const normalizedPhone = normalizePhoneForFirebase(payload.phone || '');
        if (!normalizedPhone) {
          Alert.alert(
            'Invalid Phone',
            'Phone number invalid hai. Please include valid number.',
          );
          return;
        }
        const confirmation = await auth().signInWithPhoneNumber(normalizedPhone);
        Alert.alert('Success', 'OTP sent successfully');
        navigation.navigate('otpScreen', {
          identifier: normalizedPhone,
          authMode: 'firebase_phone',
          verificationId: confirmation.verificationId,
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
    if (!googleSigninLib?.GoogleSignin) {
      Alert.alert(
        'Google Sign-In Not Ready',
        'App ko rebuild karna hoga (native module missing).',
      );
      return;
    }

    const { GoogleSignin, statusCodes } = googleSigninLib;

    try {
      setIsGoogleLoading(true);
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const userInfo = await GoogleSignin.signIn();
      const idToken =
        userInfo?.data?.idToken || userInfo?.idToken || undefined;
      if (!idToken) {
        Alert.alert(
          'Google Sign-In Error',
          'Unable to get Google ID token. Please try again.',
        );
        return;
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const credentialResult = await auth().signInWithCredential(
        googleCredential,
      );
      const firebaseUser = credentialResult.user;
      const displayName = firebaseUser.displayName || '';
      const [firstName = 'Google', ...rest] = displayName.split(' ');
      const lastName = rest.join(' ') || 'User';

      dispatch(
        setFirebaseUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName,
          lastName,
        }),
      );

      await AsyncStorage.setItem('userVerified', 'true');
      Alert.alert('Success', 'Logged in with Google!');
      navigation.replace('MainDrawer');
    } catch (error: any) {
      console.error(error);
      const normalizedCode = `${error?.code ?? ''}`;

      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      if (error?.code === statusCodes.IN_PROGRESS) return;
      if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available');
        return;
      }
      if (normalizedCode === '12500') {
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
              placeholder="Enter your email or phone"
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
