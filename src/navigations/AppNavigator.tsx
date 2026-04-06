import { createStackNavigator } from '@react-navigation/stack';
import DetailsScreen from '../screens/dashboard/DetailsScreen/DetailsScreen';
import LoginScreen from '../screens/auth/Login/LoginScreen';
import RegisterScreen from '../screens/auth/Register/RegisterScreens';
import DrawerNavigator from './DrawerNavigator';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddProductScreen from '../screens/dashboard/AddProductScreen/AddProductScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkUserVerified = async () => {
      try {
        const isUserVerified = await AsyncStorage.getItem('userVerified');
        setInitialRoute(
          isUserVerified === 'true' ? 'MainDrawer' : 'loginScreen',
        );
      } catch (error) {
        console.error('Error checking user verification:', error);
        setInitialRoute('loginScreen');
      }
    };
    checkUserVerified();
  }, []);

  if (initialRoute === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="loginScreen" component={LoginScreen} />
      <Stack.Screen name="registerScreen" component={RegisterScreen} />
      <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
      <Stack.Screen name="detailsScreen" component={DetailsScreen} />
      <Stack.Screen name="AddProductScreen" component={AddProductScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
