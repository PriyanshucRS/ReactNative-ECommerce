import React from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { useAddToCartMutation } from '../../../services/api';
import { styles } from './DetailsStyles';

interface Product {
  _id: string;
  image: string;
  category: string;
  title: string;
  name: string;
  price: number;
  description: string;
}

type DetailsScreenRouteProp = RouteProp<
  { detailsScreen: { product: Product } },
  'detailsScreen'
>;

const DetailsScreen = ({ route }: { route: DetailsScreenRouteProp }) => {
  const { product } = route.params;
  const [addToCart] = useAddToCartMutation();

  const handleAddToCart = async () => {
    try {
      if (!product || !product._id) {
        Alert.alert('Error', 'Invalid product');
        return;
      }

      await addToCart({ productId: product._id, quantity: 1 }).unwrap();
      Alert.alert('Success', `${product.title || product.name} added to cart!`);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to add to cart');
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
          <Text style={styles.title}>{product.name || product.title}</Text>

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
