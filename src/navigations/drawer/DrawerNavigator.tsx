import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector } from 'react-redux';
import HomeScreen from '../../screens/dashboard/HomeScreen/HomeScreen';
import CartScreen from '../../screens/dashboard/CartScreen/CartScreen';
import AddProductScreen from '../../screens/dashboard/AddProductScreen/AddProductScreen';
import WatchlistScreen from '../../screens/dashboard/WatchlistScreen/WatchlistScreen';
import NotificationsScreen from '../../screens/dashboard/Notifications/NotificationsScreen';
import {
  CustomDrawerContent,
  HomeDrawerIcon,
  CartDrawerIcon,
  AddProductIcon,
  WatchlistDrawerIcon,
} from './DrawerContent';
import type { RootState } from '../../store/store';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.user);

  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#0F0F23',
          width: 280,
        },
        drawerActiveTintColor: '#3B82F6',
        drawerInactiveTintColor: '#CBD5E1',
        drawerLabelStyle: {
          fontSize: 16,
          marginLeft: 10,
        },
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

      {isLoggedIn && (
        <Drawer.Screen
          name="AddProductScreen"
          component={AddProductScreen}
          options={{
            title: 'AddProduct',
            drawerIcon: AddProductIcon,
          }}
        />
      )}
      <Drawer.Screen
        name="watchlistScreen"
        component={WatchlistScreen}
        options={{
          title: 'Watchlist',
          drawerIcon: WatchlistDrawerIcon,
        }}
      />

      <Drawer.Screen
        name="notificationsScreen"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
