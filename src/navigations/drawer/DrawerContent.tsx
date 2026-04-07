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
import { persistor } from '../../store/store';
import { signout } from '../../slices/authSlice';
import { drawerContentStyles } from './DrawerContentStyles';
import { useGetWishlistQuery } from '../../services/wishlistApi';
import { useGetCartQuery } from '../../services/cartApi';
import type { RootState } from '../../store/store';

const IconContainer = ({ name, color, size, children }: any) => (
  <View style={drawerContentStyles.iconWrapper}>
    <Ionicons name={name} color={color} size={size} />
    {children}
  </View>
);

export const HomeDrawerIcon = ({ color, size }: any) => (
  <IconContainer name="home-outline" color={color} size={size} />
);
export const AddProductIcon = ({ color, size }: any) => (
  <IconContainer name="cube-outline" color={color} size={size} />
);

export const CartDrawerIcon = ({ color, size }: any) => {
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.user);
  const { data: cartItems = [] } = useGetCartQuery(undefined, {
    skip: !isLoggedIn,
  });
  const cartCount = isLoggedIn ? cartItems.length : 0;

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

export const WatchlistDrawerIcon = ({ color, size }: any) => {
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.user);
  const { data: wishlistItems = [] } = useGetWishlistQuery(undefined, {
    skip: !isLoggedIn,
  });
  const watchlistCount = isLoggedIn ? wishlistItems.length : 0;

  return (
    <IconContainer name="heart-outline" color={color} size={size}>
      {watchlistCount > 0 && (
        <View style={drawerContentStyles.badge}>
          <Text style={drawerContentStyles.badgeText}>{watchlistCount}</Text>
        </View>
      )}
    </IconContainer>
  );
};

const drawerContentStyles_internal = {
  scrollViewContent: { flex: 1 },
};

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = !!user;
  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
    : 'User';
  const displayEmail = user?.email || '';

  const handleLogout = async () => {
    try {
      dispatch(signout());
      if (typeof AsyncStorage.multiRemove === 'function') {
        await AsyncStorage.multiRemove(['userVerified', 'persist:root']);
      } else {
        await AsyncStorage.removeItem('userVerified');
        await AsyncStorage.removeItem('persist:root');
      }
      await persistor?.purge?.();

      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'MainDrawer' }],
      });
    } catch {
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'MainDrawer' }],
      });
    }
  };

  const handleLogin = () => {
    navigation.getParent()?.navigate('loginScreen');
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={drawerContentStyles_internal.scrollViewContent}
      style={drawerContentStyles.drawerContent}
    >
      <View style={drawerContentStyles.profileContainer}>
        <View style={drawerContentStyles.avatar}>
          <Text style={drawerContentStyles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={drawerContentStyles.profileTextContainer}>
          <Text style={drawerContentStyles.profileName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={drawerContentStyles.profileEmail} numberOfLines={1}>
            {displayEmail}
          </Text>
        </View>
      </View>

      <DrawerItemList {...props} />

      {isLoggedIn ? (
        <DrawerItem
          label="Logout"
          onPress={handleLogout}
          labelStyle={drawerContentStyles.logoutLabel}
          style={drawerContentStyles.logoutItem}
        />
      ) : (
        <DrawerItem
          label="Login"
          onPress={handleLogin}
          labelStyle={drawerContentStyles.loginLabel}
          style={drawerContentStyles.loginItem}
        />
      )}
    </DrawerContentScrollView>
  );
};
