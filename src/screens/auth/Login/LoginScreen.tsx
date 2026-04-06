import {
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { styles } from './LoginStyles';
import { useForm, Controller } from 'react-hook-form';
import { useLoginMutation } from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginData {
  email: string;
  password: string;
}

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginData) => {
    try {
      const trimmedData = {
        email: data.email.trim().toLowerCase(),
        password: data.password.trim(),
      };

      if (!trimmedData.email || !trimmedData.password) {
        Alert.alert('Error', 'Email and password cannot be empty');
        return;
      }

      const result = await login(trimmedData).unwrap();
      // Store token and user
      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('userVerified', 'true');
      Alert.alert('Success', 'Logged in successfully!');
      navigation.replace('MainDrawer');
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert('Error', err?.data?.message || 'Invalid credentials');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
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
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}

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
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                onBlur={onBlur}
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

        <TouchableOpacity
          style={styles.btn}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
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
