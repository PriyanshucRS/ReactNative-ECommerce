import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {
  useGetCartQuery,
  useUpdateCartQuantityMutation,
  useRemoveFromCartMutation,
} from '../../../services/api';
import { useGetProductsQuery } from '../../../services/productsApi';
import { cartStyles } from './CartStyles';
import { getFallbackKey, getProductId } from '../../../utils/helpers';
import BottomTabs from '../../../components/BottomTabs';
import type { RootState } from '../../../store/store';

const CartScreen = () => {
  const navigation = useNavigation<any>();
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.user);
  const { data: allProducts = [] } = useGetProductsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const availableProductIds = new Set(
    allProducts.map(p => p.id || p._id).filter(Boolean) as string[],
  );
  const { data: fetchedCartItems = [], isLoading: isCartLoading } = useGetCartQuery(
    undefined,
    {
      skip: !isLoggedIn,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
  const cartItems = isLoggedIn ? fetchedCartItems : [];
  const [updateQuantity] = useUpdateCartQuantityMutation();
  const [removeFromCart] = useRemoveFromCartMutation();

  const confirmRemoveFromCart = (item: any) => {
    Alert.alert(
      'Remove Item',
      `Do you want to remove ${item.title || 'this item'} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFromCart({ productId: getProductId(item) });
          },
        },
      ],
    );
  };

  const totalPrice = cartItems.reduce(
    (total: number, item: any) =>
      item.unavailable ? total : total + item.price * item.quantity,
    0,
  );

  const renderItem = ({ item }: any) => {
    const isUnavailable =
      item.unavailable || !availableProductIds.has(getProductId(item));

    return (
      <View
        style={[cartStyles.cartItem, isUnavailable && cartStyles.unavailableCard]}
      >
        <View style={cartStyles.imgBox}>
          <Image
            source={{ uri: item.image }}
            style={[cartStyles.img, isUnavailable && { opacity: 0.45 }]}
          />
        </View>

        <View style={cartStyles.info}>
          <Text
            style={[cartStyles.name, isUnavailable && { color: '#9CA3AF' }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {isUnavailable && (
            <Text style={[cartStyles.category, { color: '#2563EB' }]}>
              Unavailable (deleted)
            </Text>
          )}
        <Text
          style={[cartStyles.unitPrice, isUnavailable && { color: '#9CA3AF' }]}
        >
          Price: ₹{item.price.toLocaleString()}
        </Text>
        <Text
          style={[cartStyles.category, isUnavailable && { color: '#9CA3AF' }]}
        >
          {item.category}
        </Text>
        <Text style={[cartStyles.price, isUnavailable && { color: '#9CA3AF' }]}>
          ₹{(item.price * item.quantity).toLocaleString()}
        </Text>

        <View style={cartStyles.actionRow}>
          <View style={cartStyles.counterContainer}>
            <TouchableOpacity
              style={[
                cartStyles.btnAction,
                isUnavailable && { opacity: 0.4 },
              ]}
              onPress={async () => {
                if (isUnavailable) return;
                if (item.quantity > 1) {
                  await updateQuantity({
                    productId: getProductId(item),
                    quantity: item.quantity - 1,
                  });
                } else {
                  confirmRemoveFromCart(item);
                }
              }}
            >
              <Text style={cartStyles.btnText}>-</Text>
            </TouchableOpacity>

            <Text style={cartStyles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={[
                cartStyles.btnAction,
                isUnavailable && { opacity: 0.4 },
              ]}
              onPress={async () => {
                if (isUnavailable) return;
                await updateQuantity({
                  productId: getProductId(item),
                  quantity: item.quantity + 1,
                });
              }}
            >
              <Text style={cartStyles.btnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => confirmRemoveFromCart(item)}
            style={cartStyles.removeBtn}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        </View>
      </View>
    );
  };

  if (isCartLoading) {
    return (
      <View style={cartStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={cartStyles.container}>
      <TouchableOpacity
        style={cartStyles.backButton}
        onPress={() =>
          navigation.getParent()?.navigate('MainDrawer', { screen: 'homeScreen' })
        }
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      <FlatList
        data={cartItems}
        keyExtractor={getFallbackKey}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 86 }}
        ListEmptyComponent={
          <View style={cartStyles.emptyContainer}>
            <Text style={cartStyles.empty}>
              {isLoggedIn ? 'Your cart is empty! 🛒' : 'Login to view cart items.'}
            </Text>
          </View>
        }
      />

      {cartItems.length > 0 && (
        <View style={cartStyles.footer}>
          <View style={cartStyles.totalRow}>
            <Text style={cartStyles.totalLabel}>Total Amount</Text>
            <Text style={cartStyles.totalAmount}>
              ₹{totalPrice.toLocaleString()}
            </Text>
          </View>
        </View>
      )}
      <BottomTabs activeTab="cart" />
    </View>
  );
};

export default CartScreen;
