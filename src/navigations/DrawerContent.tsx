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
import { persistor } from '../store/store';
import { clearUser } from '../slices/authSlice';
import { selectedItems } from '../slices/cartSlice';
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

// Icon renderer function outside component to prevent recreation on render
const renderLogoutIcon = ({ color, size }: { color: string; size: number }) => (
  <LogoutIcon color={color} size={size} />
);

const drawerContentStyles_internal = {
  scrollViewContent: { flex: 1 },
};

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { navigation } = props;
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      dispatch(clearUser());
      if (typeof AsyncStorage.multiRemove === 'function') {
        await AsyncStorage.multiRemove(['userVerified', 'persist:root']);
      } else {
        await AsyncStorage.removeItem('userVerified');
        await AsyncStorage.removeItem('persist:root');
      }
      await persistor?.purge?.();

      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'loginScreen' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'loginScreen' }],
      });
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={drawerContentStyles_internal.scrollViewContent}
      style={drawerContentStyles.drawerContent}
    >
      <DrawerItemList {...props} />

      {/* Manual Logout Item */}
      <DrawerItem
        label="Logout"
        icon={renderLogoutIcon}
        onPress={handleLogout}
        labelStyle={drawerContentStyles.logoutLabel}
        style={drawerContentStyles.logoutItem}
      />
    </DrawerContentScrollView>
  );
};
