import {
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  View,
} from 'react-native';
import React, { useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './RegisterStyles';
import { useForm, Controller } from 'react-hook-form';
import { useRegisterMutation } from '../../../services/api';
import type { RootStackParamList } from '../../../navigations/types';
import type { RouteProp } from '@react-navigation/native';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const PHONE_REGEX = /^\d{10}$/;
const INVALID_SERIES_PHONES = new Set([
  '0123456789',
  '1234567890',
  '9876543210',
  '0000000000',
  '1111111111',
  '2222222222',
  '3333333333',
  '4444444444',
  '5555555555',
  '6666666666',
  '7777777777',
  '8888888888',
  '9999999999',
]);

const RegisterScreen = () => {
  type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'registerScreen'>;
  const navigation = useNavigation<any>();
  const route = useRoute<RegisterScreenRouteProp>();
  const [register, { isLoading }] = useRegisterMutation();

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<RegisterData>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    const prefill = route.params;
    if (!prefill) return;
    const current = getValues();
    reset({
      ...current,
      email: prefill.prefillEmail || current.email,
      phone: prefill.prefillPhone || current.phone,
      firstName: prefill.prefillFirstName || current.firstName,
      lastName: prefill.prefillLastName || current.lastName,
    });
  }, [route.params, reset, getValues]);

  const onSubmit = async (data: RegisterData) => {
    try {
      // Trim whitespace from all fields
      const trimmedData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
      };
      await register(trimmedData).unwrap();
      Alert.alert('Success', 'Account created! Please login.');
      reset();
      navigation.replace('loginScreen');
    } catch (error: any) {
      Alert.alert('Error', error.data?.message || 'Registration failed');
    }
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
          rules={{
            required: 'First name is required',
            minLength: {
              value: 2,
              message: 'First name must be at least 2 letters',
            },
            validate: value =>
              NAME_REGEX.test((value || '').trim()) ||
              'First name should contain letters only',
          }}
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
          rules={{
            required: 'Last name is required',
            minLength: {
              value: 2,
              message: 'Last name must be at least 2 letters',
            },
            validate: value =>
              NAME_REGEX.test((value || '').trim()) ||
              'Last name should contain letters only',
          }}
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
          name="phone"
          rules={{
            required: 'Phone is required',
            validate: value => {
              const cleaned = `${value || ''}`.replace(/[^\d]/g, '');
              if (!PHONE_REGEX.test(cleaned)) {
                return 'Enter a valid 10-digit phone number';
              }
              if (INVALID_SERIES_PHONES.has(cleaned)) {
                return 'Please enter a real phone number';
              }
              return true;
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="Enter your contact number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              onBlur={onBlur}
              onChangeText={text => onChange(text.replace(/[^\d]/g, ''))}
              value={value}
              maxLength={10}
            />
          )}
        />
        {errors.phone && (
          <Text style={styles.errorText}>{errors.phone.message}</Text>
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
