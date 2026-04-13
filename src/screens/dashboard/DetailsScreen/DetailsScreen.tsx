import React, { useEffect, useMemo, useState } from 'react';
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
import {
  useDeleteProductMutation,
  useGetProductByIdQuery,
} from '../../../services/productsApi';
import { styles } from './DetailsStyles';
import { getProductId } from '../../../utils/helpers';
import type { RootStackParamList } from '../../../navigations/types';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import BottomTabs, {
  useBottomTabsContentPadding,
} from '../../../components/BottomTabs';

type DetailsScreenProps = StackScreenProps<RootStackParamList, 'detailsScreen'>;

const DetailsScreen = ({ route, navigation }: DetailsScreenProps) => {
  const bottomSpacing = useBottomTabsContentPadding();
  const { product: routeProduct } = route.params;
  const [addToCart] = useAddToCartMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.user);
  const { data: cartItems = [], refetch: refetchCart } = useGetCartQuery(
    undefined,
    {
      skip: !isLoggedIn,
    },
  );

  const productId = getProductId(routeProduct);
  const { data: liveProduct } = useGetProductByIdQuery(productId, {
    skip: !productId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const product = (liveProduct || routeProduct) as any;

  const ownerId = (product as any)?.userId;
  const currentUserId = authUser?.uid || authUser?._id;
  const isOwner = !!ownerId && !!currentUserId && ownerId === currentUserId;
  const existingCartItem = cartItems.find(
    (item: any) => getProductId(item) === productId,
  );
  const existingQuantity = isLoggedIn
    ? Number(existingCartItem?.quantity) || 0
    : 0;
  const [localExistingQuantity, setLocalExistingQuantity] = useState<
    number | null
  >(null);

  const displayExistingQuantity = useMemo(
    () => localExistingQuantity ?? existingQuantity,
    [localExistingQuantity, existingQuantity],
  );
  useEffect(() => {
    setLocalExistingQuantity(null);
  }, [existingQuantity, productId]);

  const handleDeleteProduct = async () => {
    if (!productId) {
      Alert.alert('Error', 'Invalid product');
      return;
    }
    Alert.alert(
      'Delete product',
      'Kya aap sure ho? Ye product permanently delete ho jayega.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(productId).unwrap();
              Alert.alert('Deleted', 'Product delete ho gaya.');
              navigation.goBack();
            } catch (error: any) {
              const msg =
                error?.data?.message ||
                (typeof error?.data === 'string' ? error.data : undefined) ||
                error?.error ||
                'Failed to delete product';
              Alert.alert('Error', msg);
            }
          },
        },
      ],
    );
  };

  const handleEditProduct = () => {
    if (!isOwner) return;
    // DetailsScreen is in the root stack; navigate on the same stack.
    navigation.navigate('AddProductScreen', { product });
  };

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

      const items = await addToCart({ productId, quantity: 1 }).unwrap();
      const line = items.find(
        (row: { productId?: string; _id?: string; id?: string }) =>
          getProductId(row) === productId,
      );
      const newQty = Number(line?.quantity) || existingQuantity + 1;
      setLocalExistingQuantity(newQty);
      await refetchCart();
      const name = product.title || product.name || 'Item';
      Alert.alert('Cart updated', `${name} — ab cart me quantity: ${newQty}`);
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
      {isOwner && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteProduct}
        >
          <Ionicons name="trash-outline" size={18} color="#111827" />
        </TouchableOpacity>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomSpacing + 80 }}
      >
        <View style={styles.imageBox}>
          <Image source={{ uri: product.image }} style={styles.image} />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.title}>{product.name || product.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
            {isOwner && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditProduct}
              >
                <Ionicons name="create-outline" size={16} color="#2563EB" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.descTitle}>About this item</Text>
          <Text style={styles.desc}>{product.description}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { bottom: bottomSpacing - 24 }]}>
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>
            {displayExistingQuantity > 0
              ? `Add to Cart (${displayExistingQuantity})`
              : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
      <BottomTabs />
    </View>
  );
};

export default DetailsScreen;
