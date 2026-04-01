import React from 'react';
import { View, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore } from 'redux-persist';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { selectedItems } from '../store/slices/cartSlice';
import { drawerContentStyles } from './DrawerContentStyles';

const IconContainer = ({ name, color, size, children }: any) => (
  <View style={drawerContentStyles.iconWrapper}>
    <Ionicons name={name} color={color} size={size} />
    {children}
  </View>
);

export const LogoutIcon = ({ color, size }: any) => (
  <IconContainer name="log-out-outline" color={color} size={size} />
);
export const HomeDrawerIcon = ({ color, size }: any) => (
  <IconContainer name="home-outline" color={color} size={size} />
);
export const AddProductIcon = ({ color, size }: any) => (
  <IconContainer name="cube-outline" color={color} size={size} />
);

export const CartDrawerIcon = ({ color, size }: any) => {
  const cartItems = useSelector(selectedItems);
  const cartCount = cartItems.length;

  return (
    <IconContainer name="cart-outline" color={color} size={size}>
      {cartCount > 0 && (
        <View style={drawerContentStyles.badge}>
          <Text style={drawerContentStyles.badgeText}>{cartCount}</Text>
        </View>
      )}
    </IconContainer>
  );
};

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const persistor = persistStore(store);

  const handleLogout = async () => {
    dispatch(logout());
    await AsyncStorage.multiRemove(['userVerified', 'persist:root']);
    persistor.purge();

    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'loginScreen' }],
    });
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1 }}
      style={drawerContentStyles.drawerContent}
    >
      <DrawerItemList
        {...props}
        itemStyle={drawerContentStyles.drawerItem}
        labelStyle={drawerContentStyles.drawerLabel}
      />

      {/* Manual Logout Item */}
      <DrawerItem
        label="Logout"
        icon={({ color, size }) => <LogoutIcon color={color} size={size} />}
        onPress={handleLogout}
        labelStyle={drawerContentStyles.logoutLabel}
        style={drawerContentStyles.logoutItem}
        labelProps={{ numberOfLines: 1 }}
      />
    </DrawerContentScrollView>
  );
};
