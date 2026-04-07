import React from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { StackScreenProps } from '@react-navigation/stack';
import { useAddToCartMutation, useGetCartQuery } from '../../../services/api';
import { styles } from './DetailsStyles';
import { getProductId } from '../../../utils/helpers';
import type { RootStackParamList } from '../../../navigations/types';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import BottomTabs from '../../../components/BottomTabs';

type DetailsScreenProps = StackScreenProps<RootStackParamList, 'detailsScreen'>;

const DetailsScreen = ({ route, navigation }: DetailsScreenProps) => {
  const { product } = route.params;
  const [addToCart] = useAddToCartMutation();
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.user);
  const { data: cartItems = [] } = useGetCartQuery(undefined, {
    skip: !isLoggedIn,
  });

  const productId = getProductId(product);
  const existingCartItem = cartItems.find(
    (item: any) => getProductId(item) === productId,
  );
  const existingQuantity = isLoggedIn ? existingCartItem?.quantity || 0 : 0;

  const handleAddToCart = async () => {
    try {
      if (!product || !productId) {
        Alert.alert('Error', 'Invalid product');
        return;
      }

      if (!isLoggedIn) {
        Alert.alert(
          'Login Required',
          'Add to cart karne ke liye pehle login karein.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'OK',
              onPress: () => navigation.navigate('loginScreen'),
            },
          ],
        );
        return;
      }

      if (existingQuantity > 0) {
        Alert.alert(
          'Already in Cart',
          `${product.title || product.name} is already in your cart (Qty: ${existingQuantity}).`,
        );
        return;
      }

      await addToCart({ productId, quantity: 1 }).unwrap();
      Alert.alert('Success', `${product.title || product.name} added to cart!`);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        (typeof error?.data === 'string' ? error.data : undefined) ||
        error?.error ||
        'Failed to add to cart';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageBox}>
          <Image source={{ uri: product.image }} style={styles.image} />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.title}>{product.name || product.title}</Text>

          <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>

          <View style={styles.divider} />

          <Text style={styles.descTitle}>About this item</Text>
          <Text style={styles.desc}>{product.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>
            {existingQuantity > 0
              ? `Already in Cart (${existingQuantity})`
              : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
      <BottomTabs />
    </View>
  );
};

export default DetailsScreen;
