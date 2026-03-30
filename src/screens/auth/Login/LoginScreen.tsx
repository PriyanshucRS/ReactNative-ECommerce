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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './LoginStyles';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { setUser } from '../../../store/slices/authSlice';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const passwordInputRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleLogin = async (data: any) => {
    setLoading(true);
    try {
      const storedEmail = await AsyncStorage.getItem('email');
      const storedPassword = await AsyncStorage.getItem('password');

      if (storedEmail === data.email && storedPassword === data.password) {
        const firstName = (await AsyncStorage.getItem('firstName')) || '';
        const lastName = (await AsyncStorage.getItem('lastName')) || '';
        const userData = {
          id: Date.now().toString(),
          email: storedEmail!,
          firstName,
          lastName,
          password: data.password,
        };
        dispatch(setUser(userData));
        navigation.replace('MainDrawer');
      } else {
        console.log('Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Login error:', error);
    } finally {
      setLoading(false);
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
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Invalid email address',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter Email"
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
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
              message:
                'Password must include uppercase, number, and special character',
            },
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
                placeholder="Password"
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
          onPress={handleSubmit(handleLogin)}
          disabled={loading}
        >
          {loading ? (
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

        <TouchableOpacity
          onPress={() => navigation.replace('MainDrawer')}
          style={styles.new1}
        >
          <Text style={styles.text}>Skip to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;
