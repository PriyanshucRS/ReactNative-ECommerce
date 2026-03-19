import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../../redux/cartSlice';
import { styles } from './DetailsStyles';
import { selectedItems } from '../../../redux/cartSlice';

const DetailsScreen = ({ route }: any) => {
  const { product } = route.params;
  const dispatch = useDispatch();
  const cartItems = useSelector(selectedItems);

  const handleAddToCart = () => {
    const isProductInCart = cartItems.some(
      (item: any) => item.id === product.id,
    );

    if (isProductInCart) {
      Alert.alert(
        'Already in Cart',
        `${product.name} is already there. We've updated the count!`,
      );
      dispatch(addToCart(product));
    } else {
      dispatch(addToCart(product));
      Alert.alert('Success', `${product.name} has been added to your cart.`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageBox}>
          <Image source={product.image} style={styles.image} />
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
