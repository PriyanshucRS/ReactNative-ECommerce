import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { selectedItems } from '../store/slices/cartSlice';

export const LogoutIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => <Ionicons name="log-out-outline" color={color} size={size} />;

export const HomeDrawerIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => <Ionicons name="home-outline" color={color} size={size} />;

export const AddProductIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => <Ionicons name="cube-outline" color={color} size={size} />;

export const CartDrawerIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => {
  const cartItems = useSelector(selectedItems);
  const cartCount = cartItems.length;

  return (
    <View style={drawerStyles.iconWrapper}>
      <Ionicons name="cart-outline" color={color} size={size} />
      {cartCount > 0 && (
        <View style={drawerStyles.badge}>
          <Text style={drawerStyles.badgeText}>{cartCount}</Text>
        </View>
      )}
    </View>
  );
};

const drawerStyles = StyleSheet.create({
  iconWrapper: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
});

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { navigation } = props;

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userVerified');
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'loginScreen' }],
    });
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label="Logout" icon={LogoutIcon} onPress={handleLogout} />
    </DrawerContentScrollView>
  );
};
