import { createStackNavigator } from '@react-navigation/stack';
import DetailsScreen from '../screens/dashboard/DetailsScreen/DetailsScreen';
import LoginScreen from '../screens/auth/Login/LoginScreen';
import RegisterScreen from '../screens/auth/Register/RegisterScreens';
import DrawerNavigator from './DrawerNavigator';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddProductScreen from '../screens/dashboard/AddProductScreen/AddProductScreen';
const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkUserVerified = async () => {
      const isUserVerified = await AsyncStorage.getItem('userVerified');

      setInitialRoute(isUserVerified === 'true' ? 'MainDrawer' : 'loginScreen');
    };
    checkUserVerified();
  }, []);

  if (initialRoute === null) {
    return null;
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
