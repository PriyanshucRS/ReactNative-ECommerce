import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { selectedItems } from '../../../redux/cartSlice';
import { useSelector } from 'react-redux';
import { styles } from './HeaderStyles';
import { useNavigation } from '@react-navigation/native';

export const HeaderScreen = () => {
  const cartItems = useSelector(selectedItems);
  const cartCount = cartItems.length;
  const navigation = useNavigation<any>();
  return (
    <View>
      <View style={styles.headerRow}>
        <Image
          source={require('../../../assets/main_logo.jpg')}
          style={styles.logo}
        />
        <Text style={styles.Title}>Let's Go Shopping!</Text>

        <TouchableOpacity
          style={styles.cartWrapper}
          onPress={() => navigation.navigate('cartScreen')}
        >
          <Image
            source={require('../../../assets/trolley.png')}
            style={styles.cartLogo}
          />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.shutterBtn}>
          <Text
            style={styles.shutterText}
            onPress={() => navigation.navigate('loginScreen')}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
