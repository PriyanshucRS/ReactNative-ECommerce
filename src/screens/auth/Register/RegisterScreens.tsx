import { Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { styles } from './RegisterStyles';
import { useForm, Controller } from 'react-hook-form';

const LoginScreen = () => {
  const navigation = useNavigation<any>();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    navigation.navigate('loginScreen');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.headerText}>Create Account</Text>
      {/* First Name */}
      <Controller
        control={control}
        name="firstName"
        rules={{
          required: 'firstName is required',
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            placeholder="First Name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.firstName && (
        <Text style={styles.errorText}>
          {errors.firstName.message as string}
        </Text>
      )}

      {/* Last Name */}
      <Controller
        control={control}
        name="lastName"
        rules={{
          required: 'lastName is required',
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            placeholder="Last Name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.lastName && (
        <Text style={styles.errorText}>
          {errors.lastName.message as string}
        </Text>
      )}

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
            placeholder="Email"
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
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Password"
            // secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.password && (
        <Text style={styles.errorText}>
          {errors.password.message as string}
        </Text>
      )}

      {/* Confirm Password Field */}
      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          required: 'Confirm Password is required',
          minLength: {
            value: 6,
            message: 'Confirm Password must be 6 characters',
          },
          validate: value =>
            value === watch('password') || 'Passwords do not match',
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            placeholder="Confirm Password"
            // secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.confirmPassword && (
        <Text style={styles.errorText}>
          {errors.confirmPassword.message as string}
        </Text>
      )}

      {/* Buttons Section */}
      <TouchableOpacity style={styles.btn} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.btnText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('loginScreen')}
        style={styles.new}
      >
        <Text style={styles.text1}>Already have an account? Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('homeScreen')}
        style={styles.new1}
      >
        <Text style={styles.text}>Skip to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LoginScreen;
