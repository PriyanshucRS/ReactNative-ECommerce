import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/dashboard/HomeScreen/HomeScreen';
import DetailsScreen from '../screens/dashboard/DetailsScreen/DetailsScreen';
import CartScreen from '../screens/dashboard/CartScreen/CartScreen';
import LoginScreen from '../screens/auth/Login/LoginScreen';
import RegisterScreen from '../screens/auth/Register/RegisterScreens';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="loginScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="loginScreen" component={LoginScreen} />
      <Stack.Screen name="registerScreen" component={RegisterScreen} />
      <Stack.Screen name="homeScreen" component={HomeScreen} />
      <Stack.Screen name="detailsScreen" component={DetailsScreen} />
      <Stack.Screen name="cartScreen" component={CartScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
