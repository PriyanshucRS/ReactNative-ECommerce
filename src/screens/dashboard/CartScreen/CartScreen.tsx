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
import { cartStyles } from './CartStyles';
import { getFallbackKey, getProductId } from '../../../utils/helpers';
import BottomTabs from '../../../components/BottomTabs';
import type { RootState } from '../../../store/store';

const CartScreen = () => {
  const navigation = useNavigation<any>();
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.user);
  const { data: fetchedCartItems = [], isLoading: isCartLoading } = useGetCartQuery(
    undefined,
    { skip: !isLoggedIn },
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
    (total: number, item: any) => total + item.price * item.quantity,
    0,
  );

  const renderItem = ({ item }: any) => (
    <View style={cartStyles.cartItem}>
      <View style={cartStyles.imgBox}>
        <Image source={{ uri: item.image }} style={cartStyles.img} />
      </View>

      <View style={cartStyles.info}>
        <Text style={cartStyles.name} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={cartStyles.unitPrice}>
          Price: ₹{item.price.toLocaleString()}
        </Text>
        <Text style={cartStyles.category}>{item.category}</Text>
        <Text style={cartStyles.price}>
          ₹{(item.price * item.quantity).toLocaleString()}
        </Text>

        <View style={cartStyles.actionRow}>
          <View style={cartStyles.counterContainer}>
            <TouchableOpacity
              style={cartStyles.btnAction}
              onPress={async () => {
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
              style={cartStyles.btnAction}
              onPress={async () => {
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
        onPress={() => navigation.navigate('homeScreen')}
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
