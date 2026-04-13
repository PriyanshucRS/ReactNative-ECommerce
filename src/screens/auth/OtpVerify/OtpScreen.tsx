import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../navigations/types';
import { styles } from './OtpStyles';
import { useLoginMutation, useVerifyOtpMutation } from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showWelcomeNotification } from '../../../services/notificationService';

const OTP_LEN = 6;
const DEFAULT_EXPIRES_SECONDS = 5 * 60;

const parseIdentifier = (value: string) => ({
  email: value.trim().toLowerCase(),
});

const formatSeconds = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = `${Math.floor(s / 60)}`.padStart(2, '0');
  const ss = `${s % 60}`.padStart(2, '0');
  return `${mm}:${ss}`;
};

const OtpScreen = () => {
  type OtpRouteProp = RouteProp<RootStackParamList, 'otpScreen'>;
  const route = useRoute<OtpRouteProp>();
  const navigation = useNavigation<any>();

  const params = route.params as RootStackParamList['otpScreen'] | undefined;
  const identifier = params?.identifier || '';
  const initialExpires = DEFAULT_EXPIRES_SECONDS;

  const [requestOtp, { isLoading: isResending }] = useLoginMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LEN }, () => ''),
  );
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] =
    useState<number>(initialExpires);

  const inputsRef = useRef<Array<TextInput | null>>([]);

  const otp = useMemo(() => digits.join(''), [digits]);
  const isComplete = otp.length === OTP_LEN && !digits.some(d => !d);
  const isExpired = remainingSeconds <= 0;

  useEffect(() => {
    const t = setInterval(() => {
      setRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // focus first box on mount
    const first = inputsRef.current[0];
    first?.focus?.();
  }, []);

  const setDigitAt = (index: number, val: string) => {
    setDigits(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const fillFromIndex = (index: number, text: string) => {
    const onlyDigits = `${text}`.replace(/[^\d]/g, '');
    if (!onlyDigits) return;

    setDigits(prev => {
      const next = [...prev];
      let i = index;
      for (const ch of onlyDigits) {
        if (i >= OTP_LEN) break;
        next[i] = ch;
        i += 1;
      }
      return next;
    });

    const nextIndex = Math.min(index + onlyDigits.length, OTP_LEN - 1);
    requestAnimationFrame(() => {
      inputsRef.current[nextIndex]?.focus?.();
    });
  };

  const onChangeBox = (index: number, text: string) => {
    const cleaned = `${text}`.replace(/[^\d]/g, '');
    if (cleaned.length > 1) {
      fillFromIndex(index, cleaned);
      return;
    }
    const ch = cleaned.slice(-1);
    setDigitAt(index, ch);
    if (ch && index < OTP_LEN - 1) {
      requestAnimationFrame(() => inputsRef.current[index + 1]?.focus?.());
    }
  };

  const onKeyPress = (index: number, key: string) => {
    if (key !== 'Backspace') return;
    const current = digits[index];
    if (current) {
      setDigitAt(index, '');
      return;
    }
    if (index > 0) {
      requestAnimationFrame(() => inputsRef.current[index - 1]?.focus?.());
      setDigitAt(index - 1, '');
    }
  };

  const onVerify = async () => {
    if (!isComplete) {
      console.warn('[OTP][FRONTEND] Verify blocked: OTP incomplete', {
        otpLength: otp.length,
      });
      Alert.alert('Error', 'Please enter the full OTP');
      return;
    }
    if (isExpired) {
      console.warn('[OTP][FRONTEND] Verify blocked: OTP expired on timer');
      Alert.alert('OTP Expired', 'OTP expire ho gaya. Please resend OTP.');
      return;
    }

    try {
      const payload = parseIdentifier(identifier);
      console.log('[OTP][FRONTEND] Verify request', {
        identifier,
        payload,
        otpLength: otp.length,
      });
      const response: any = await verifyOtp({ ...payload, otp }).unwrap();
      console.log('[OTP][FRONTEND] Verify success', {
        uid: response?.user?.uid,
        email: response?.user?.email,
        hasAccessToken: Boolean(response?.accessToken),
        hasRefreshToken: Boolean(response?.refreshToken),
      });
      if (response?.accessToken) {
        await AsyncStorage.setItem('token', response.accessToken);
      }
      if (response?.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.refreshToken);
      }
      await AsyncStorage.setItem('userVerified', 'true');

      const firstName = response?.user?.firstName || '';
      const lastName = response?.user?.lastName || '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
      const identityKey = `uid:${
        response?.user?.uid || response?.user?.email || identifier
      }`;
      const alreadySeen =
        (await AsyncStorage.getItem(`login_seen_${identityKey}`)) === '1';
      await AsyncStorage.setItem(`login_seen_${identityKey}`, '1');
      try {
        await showWelcomeNotification(fullName || 'User', !alreadySeen);
      } catch (notificationErr: any) {
        console.error('[OTP][FRONTEND] Notification failed (non-blocking)', {
          message: notificationErr?.message,
          code: notificationErr?.code,
        });
      }

      Alert.alert('Success', 'Logged in successfully!');
      navigation.replace('MainDrawer');
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || 'OTP verification failed';
      console.error('[OTP][FRONTEND] Verify failed', {
        message: msg,
        status: err?.status,
        data: err?.data,
        rawError: err,
      });
      if (`${msg}`.toLowerCase().includes('expired')) {
        setRemainingSeconds(0);
      }
      Alert.alert('Error', msg);
    }
  };

  const onResend = async () => {
    try {
      const payload = parseIdentifier(identifier);
      console.log('[OTP][FRONTEND] Resend request', {
        identifier,
        payload,
      });
      const response: any = await requestOtp(payload).unwrap();
      const responseMessage = response?.message || 'OTP resent successfully';
      console.log('[OTP][FRONTEND] Resend success', {
        message: responseMessage,
      });
      setDigits(Array.from({ length: OTP_LEN }, () => ''));
      setRemainingSeconds(DEFAULT_EXPIRES_SECONDS);
      requestAnimationFrame(() => inputsRef.current[0]?.focus?.());
      Alert.alert('Success', responseMessage);
    } catch (err: any) {
      console.error('[OTP][FRONTEND] Resend failed', {
        status: err?.status,
        data: err?.data,
        rawError: err,
      });
      Alert.alert('Error', err?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <View style={styles.avoidContainer}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerText}>Verify OTP</Text>
        <Text style={styles.subText}>
          OTP sent to {identifier}. Please enter the 6-digit code.
        </Text>

        <View style={styles.otpRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={r => {
                inputsRef.current[i] = r;
              }}
              value={d}
              onChangeText={t => onChangeBox(i, t)}
              onKeyPress={e => onKeyPress(i, e.nativeEvent.key)}
              style={[
                styles.otpBox,
                focusedIndex === i ? styles.otpBoxActive : null,
              ]}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={1}
              onFocus={() => setFocusedIndex(i)}
              autoCorrect={false}
              autoCapitalize="none"
              importantForAutofill="yes"
              textContentType="oneTimeCode"
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.btn,
            (!isComplete || isExpired || isVerifying) ? styles.btnDisabled : null,
          ]}
          onPress={onVerify}
          disabled={!isComplete || isExpired || isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Verify</Text>
          )}
        </TouchableOpacity>

        {!isExpired ? (
          <Text style={styles.otpInfoText}>
            OTP expires in {formatSeconds(remainingSeconds)}
          </Text>
        ) : (
          <Text style={styles.otpInfoText}>
            OTP expired. Please resend OTP.
          </Text>
        )}

        <TouchableOpacity
          onPress={onResend}
          style={styles.resendLink}
          disabled={isResending}
        >
          <Text style={styles.resendText}>
            {isResending ? 'Sending...' : 'Resend OTP'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.replace('loginScreen')}
          style={styles.changeLink}
        >
          <Text style={styles.changeText}>Change email</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default OtpScreen;

