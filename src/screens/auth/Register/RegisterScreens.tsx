import {
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  View,
} from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { styles } from './RegisterStyles';
import { useForm, Controller } from 'react-hook-form';
import { useRegisterMutation } from '../../../services/api';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const [register, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [_, setConfirmPasswordFocused] = useState(false);
  const passwordInputRef = useRef<any>(null);
  const confirmPasswordInputRef = useRef<any>(null);

  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);
  const [hasMinLength, setHasMinLength] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RegisterData>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  useEffect(() => {
    const lower = /[a-z]/.test(password);
    const upper = /[A-Z]/.test(password);
    const number = /[0-9]/.test(password);
    const special = /[!@#$%^&*]/.test(password);
    const length = password.length >= 6;

    setHasLowercase(lower);
    setHasUppercase(upper);
    setHasNumber(number);
    setHasSpecial(special);
    setHasMinLength(length);
  }, [password]);

  const getCriteriaColor = (met: boolean) => (met ? '#10B981' : '#EF4444');

  const onSubmit = async (data: RegisterData) => {
    try {
      const { confirmPassword: _confirmPassword, ...registerData } = data;
      // Trim whitespace from all fields
      const trimmedData = {
        ...registerData,
        firstName: registerData.firstName.trim(),
        lastName: registerData.lastName.trim(),
        email: registerData.email.trim(),
      };
      await register(trimmedData).unwrap();
      Alert.alert('Success', 'Account created! Please login.');
      reset();
      navigation.replace('loginScreen');
    } catch (error: any) {
      Alert.alert('Error', error.data?.message || 'Registration failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  return (
    <View style={styles.avoidContainer}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerText}>Create Account</Text>

        <Controller
          control={control}
          name="firstName"
          rules={{ required: 'First name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="Enter your first name"
              placeholderTextColor="#9CA3AF"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.firstName && (
          <Text style={styles.errorText}>{errors.firstName.message}</Text>
        )}

        <Controller
          control={control}
          name="lastName"
          rules={{ required: 'Last name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="Enter your last name"
              placeholderTextColor="#9CA3AF"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.lastName && (
          <Text style={styles.errorText}>{errors.lastName.message}</Text>
        )}

        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}

        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Password is required',
            minLength: { value: 6, message: 'Minimum 6 characters' },
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
                onPress={togglePasswordVisibility}
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
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}

        {passwordFocused && (
          <View style={styles.Pcontainer}>
            {([
              ['Minimum 6 characters', hasMinLength],
              ['Lowercase letter', hasLowercase],
              ['Uppercase letter', hasUppercase],
              ['Number', hasNumber],
              ['Special character', hasSpecial],
            ] as [string, boolean][]).map(([label, cond], i) => (
              <Text
                key={i}
                style={[styles.Ptext, { color: getCriteriaColor(cond) }]}
              >
                • {label} {cond ? '✓' : '✗'}
              </Text>
            ))}
          </View>
        )}

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: 'Confirm Password is required',
            validate: value =>
              value === watch('password') || 'Passwords do not match',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View
              style={[
                styles.inputContainer,
                errors.confirmPassword && styles.inputError,
              ]}
            >
              <TextInput
                ref={confirmPasswordInputRef}
                style={styles.passwordInput}
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => {
                  setConfirmPasswordFocused(false);
                  onBlur();
                }}
                onChangeText={onChange}
                value={value}
              />
              <TouchableOpacity
                onPress={toggleConfirmPasswordVisibility}
                style={styles.iconButton}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.replace('loginScreen')}
          style={styles.new}
        >
          <Text style={styles.text1}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default RegisterScreen;
