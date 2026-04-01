import React from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addToCartStart, selectedItems } from '../../../store/slices/cartSlice';
import { styles } from './DetailsStyles';

const DetailsScreen = ({ route }: any) => {
  const { product } = route.params;
  const dispatch = useDispatch();
  const cartItems = useSelector(selectedItems);

  const handleAddToCart = () => {
    const productId = product.id || product._id;

    const existingItem = cartItems.find(
      (item: any) => (item.productId || item._id || item.id) === productId,
    );

    if (existingItem) {
      Alert.alert(
        'Already in Cart',
        `${product.title || product.name} is already in cart (Quantity: ${
          existingItem.quantity
        }). Quantity updated!`,
      );
    }

    dispatch(addToCartStart(product));

    if (!existingItem) {
      Alert.alert('Added!', `${product.title || product.name} added to cart.`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageBox}>
          <Image source={{ uri: product.image }} style={styles.image} />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.title}>{product.name}</Text>

          <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>

          <View style={styles.divider} />

          <Text style={styles.descTitle}>About this item</Text>
          <Text style={styles.desc}>{product.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DetailsScreen;
