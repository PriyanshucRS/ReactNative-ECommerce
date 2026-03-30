import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/dashboard/HomeScreen/HomeScreen';
import CartScreen from '../screens/dashboard/CartScreen/CartScreen';
import AddProductScreen from '../screens/dashboard/AddProductScreen/AddProductScreen';
import {
  CustomDrawerContent,
  HomeDrawerIcon,
  CartDrawerIcon,
  AddProductIcon,
} from './DrawerContent';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#1F2937',
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen
        name="homeScreen"
        component={HomeScreen}
        options={{ title: 'Home', drawerIcon: HomeDrawerIcon }}
      />
      <Drawer.Screen
        name="cartScreen"
        component={CartScreen}
        options={{
          title: 'Cart',
          drawerIcon: CartDrawerIcon,
        }}
      />

      <Drawer.Screen
        name="AddProductScreen"
        component={AddProductScreen}
        options={{
          title: 'AddProduct',
          drawerIcon: AddProductIcon,
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
