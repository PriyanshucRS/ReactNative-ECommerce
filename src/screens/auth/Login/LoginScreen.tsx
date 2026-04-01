import {
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useRef, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { styles } from './LoginStyles';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { loginRequest, clearError } from '../../../store/slices/authSlice';
import { useSelector } from 'react-redux';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const authLoading = useSelector((state: any) => state.auth.loading);
  const authError = useSelector((state: any) => state.auth.error);
  const authUser = useSelector((state: any) => state.auth.user);
  // console.log('LoginScreen authUser:', authUser); // Debug

  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const passwordInputRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (authError && !authLoading) {
      Alert.alert('Invalid Credentials');
      dispatch(clearError());
    }
    if (authUser && !authLoading && !authError) {
      Alert.alert('Success', 'Logged in successfully!');
      AsyncStorage.setItem('userVerified', 'true');
      reset();
      navigation.replace('MainDrawer');
    }
  }, [authError, authUser, authLoading, dispatch, reset, navigation]);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const loginSubmit = (data: any) => {
    dispatch(loginRequest(data));
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
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Invalid email',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
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
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message as string}</Text>
        )}

        {/* Password Field */}
        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be 6 characters' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View
              style={[
                styles.inputContainer,
                errors.password && styles.inputError,
              ]}
            >
              <TextInput
                ref={passwordInputRef}
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => {
                  setPasswordFocused(false);
                  onBlur();
                }}
                onChangeText={onChange}
                value={value}
              />
              <TouchableOpacity
                onPressIn={togglePasswordVisibility}
                onPressOut={() => {
                  if (passwordFocused) {
                    passwordInputRef.current?.focus();
                  }
                }}
                style={styles.iconButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.password && (
          <Text style={styles.errorText}>
            {errors.password.message as string}
          </Text>
        )}

        {/* Buttons Section */}
        <TouchableOpacity
          style={styles.btn}
          onPress={handleSubmit(loginSubmit)}
          disabled={authLoading}
        >
          {authLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.replace('registerScreen')}
          style={styles.new}
        >
          <Text style={styles.text1}>New here? Go to Register</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;
