import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors } from '../utils/colors';
import type { RootState } from '../store/store';

type Props = {
  activeTab?: 'home' | 'cart' | 'add' | 'watchlist';
};

const BottomTabs = ({ activeTab }: Props) => {
  const navigation = useNavigation<any>();
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.user);

  const goToDrawerScreen = (
    screenName: 'homeScreen' | 'cartScreen' | 'AddProductScreen' | 'watchlistScreen',
  ) => {
    const currentState = navigation.getState?.();
    const currentRoutes: string[] = currentState?.routeNames || [];

    // If current navigator already contains the screen, navigate directly.
    if (currentRoutes.includes(screenName)) {
      navigation.navigate(screenName);
      return;
    }

    // Otherwise, jump to Drawer (nested inside stack) and target that screen.
    // In our app `MainDrawer` lives in the root stack, so stack navigation works reliably.
    navigation.navigate('MainDrawer', { screen: screenName });
  };

  const handleAddProduct = () => {
    if (!isLoggedIn) {
      navigation.navigate('loginScreen');
      return;
    }
    goToDrawerScreen('AddProductScreen');
  };

  return (
    <View style={styles.bottomTabs}>
      <TouchableOpacity
        style={styles.bottomTabBtn}
        onPress={() => goToDrawerScreen('homeScreen')}
      >
        <Ionicons
          name={activeTab === 'home' ? 'home' : 'home-outline'}
          size={28}
          color="#FFFFFF"
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.bottomTabBtn}
        onPress={() => goToDrawerScreen('cartScreen')}
      >
        <Ionicons
          name={activeTab === 'cart' ? 'cart' : 'cart-outline'}
          size={28}
          color="#FFFFFF"
        />
      </TouchableOpacity>
      {isLoggedIn && (
        <TouchableOpacity style={styles.bottomTabBtn} onPress={handleAddProduct}>
          <Ionicons
            name={activeTab === 'add' ? 'add-circle' : 'add-circle-outline'}
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.bottomTabBtn}
        onPress={() => goToDrawerScreen('watchlistScreen')}
      >
        <Ionicons
          name={activeTab === 'watchlist' ? 'heart' : 'heart-outline'}
          size={28}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomTabs: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    paddingTop: 8,
    paddingBottom: 10,
    zIndex: 50,
    elevation: 20,
  },
  bottomTabBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 3,
  },
});

export default BottomTabs;
