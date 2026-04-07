import { createStackNavigator } from '@react-navigation/stack';
import DetailsScreen from '../screens/dashboard/DetailsScreen/DetailsScreen';
import LoginScreen from '../screens/auth/Login/LoginScreen';
import RegisterScreen from '../screens/auth/Register/RegisterScreens';
import DrawerNavigator from './drawer/DrawerNavigator';
import AddProductScreen from '../screens/dashboard/AddProductScreen/AddProductScreen';
import type { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainDrawer"
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
