import React, { useMemo } from 'react';
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
import { showAppNotification } from '../../../services/notificationService';
import BottomTabs, {
  useBottomTabsContentPadding,
} from '../../../components/BottomTabs';
import type { RootState } from '../../../store/store';

const toSafeNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const CartScreen = () => {
  const navigation = useNavigation<any>();
  const listBottomPadding = useBottomTabsContentPadding();
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.user);
  const {
    data: allProducts = [],
    isFetching: isProductsFetching,
    isError: isProductsError,
  } = useGetProductsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const availableProductIds = useMemo(
    () =>
      new Set(allProducts.map(p => p.id || p._id).filter(Boolean) as string[]),
    [allProducts],
  );
  const {
    data: fetchedCartItems = [],
    isLoading: isCartLoading,
    refetch: refetchCart,
  } = useGetCartQuery(undefined, {
    skip: !isLoggedIn,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
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
            try {
              await removeFromCart({ productId: getProductId(item) }).unwrap();
              await showAppNotification(
                'Cart Updated',
                `<b>${
                  item.title || 'Item'
                }</b> has been removed from your cart.`,
              );
              await refetchCart();
            } catch (error: any) {
              const errorMessage =
                error?.data?.message ||
                (typeof error?.data === 'string' ? error.data : undefined) ||
                error?.error ||
                'Failed to remove item';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ],
    );
  };

  const totalPrice = cartItems.reduce((total: number, item: any) => {
    const productId = getProductId(item);
    const shouldCheckAgainstProducts =
      !isProductsFetching && !isProductsError && availableProductIds.size > 0;
    const isUnavailable =
      !!item.unavailable ||
      (shouldCheckAgainstProducts &&
        !!productId &&
        !availableProductIds.has(productId));
    if (isUnavailable) return total;
    const itemPrice = toSafeNumber(item.price);
    const itemQuantity = toSafeNumber(item.quantity, 1);
    return total + itemPrice * itemQuantity;
  }, 0);

  const renderItem = ({ item }: any) => {
    const productId = getProductId(item);
    const shouldCheckAgainstProducts =
      !isProductsFetching && !isProductsError && availableProductIds.size > 0;
    const isUnavailable =
      !!item.unavailable ||
      (shouldCheckAgainstProducts &&
        !!productId &&
        !availableProductIds.has(productId));
    const itemPrice = toSafeNumber(item.price);
    const itemQuantity = toSafeNumber(item.quantity, 1);
    const itemTotal = itemPrice * itemQuantity;

    return (
      <View
        style={[
          cartStyles.cartItem,
          isUnavailable && cartStyles.unavailableCard,
        ]}
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
            style={[
              cartStyles.unitPrice,
              isUnavailable && { color: '#9CA3AF' },
            ]}
          >
            Price: ₹{itemPrice.toLocaleString()}
          </Text>
          <Text
            style={[cartStyles.category, isUnavailable && { color: '#9CA3AF' }]}
          >
            {item.category}
          </Text>
          <Text
            style={[cartStyles.price, isUnavailable && { color: '#9CA3AF' }]}
          >
            ₹{itemTotal.toLocaleString()}
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
                  if (!productId) {
                    Alert.alert('Error', 'Invalid product id');
                    return;
                  }
                  try {
                    if (itemQuantity > 1) {
                      await updateQuantity({
                        productId,
                        quantity: itemQuantity - 1,
                      }).unwrap();
                      await refetchCart();
                    } else {
                      confirmRemoveFromCart(item);
                    }
                  } catch (error: any) {
                    const errorMessage =
                      error?.data?.message ||
                      (typeof error?.data === 'string'
                        ? error.data
                        : undefined) ||
                      error?.error ||
                      'Failed to update quantity';
                    Alert.alert('Error', errorMessage);
                  }
                }}
              >
                <Text style={cartStyles.btnText}>-</Text>
              </TouchableOpacity>

              <Text style={cartStyles.quantityText}>{itemQuantity}</Text>

              <TouchableOpacity
                style={[
                  cartStyles.btnAction,
                  isUnavailable && { opacity: 0.4 },
                ]}
                onPress={async () => {
                  if (isUnavailable) return;
                  if (!productId) {
                    Alert.alert('Error', 'Invalid product id');
                    return;
                  }
                  try {
                    await updateQuantity({
                      productId,
                      quantity: itemQuantity + 1,
                    }).unwrap();
                    await refetchCart();
                  } catch (error: any) {
                    const errorMessage =
                      error?.data?.message ||
                      (typeof error?.data === 'string'
                        ? error.data
                        : undefined) ||
                      error?.error ||
                      'Failed to update quantity';
                    Alert.alert('Error', errorMessage);
                  }
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
          navigation
            .getParent()
            ?.navigate('MainDrawer', { screen: 'homeScreen' })
        }
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      <FlatList
        data={cartItems}
        keyExtractor={getFallbackKey}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: listBottomPadding }}
        ListEmptyComponent={
          <View style={cartStyles.emptyContainer}>
            <Text style={cartStyles.empty}>
              {isLoggedIn
                ? 'Your cart is empty! 🛒'
                : 'Login to view cart items.'}
            </Text>
          </View>
        }
      />

      {cartItems.length > 0 && (
        <View
          style={[cartStyles.footer, { marginBottom: listBottomPadding - 8 }]}
        >
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
