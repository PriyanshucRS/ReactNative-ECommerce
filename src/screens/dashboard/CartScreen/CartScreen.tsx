import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  useGetCartQuery,
  useUpdateCartQuantityMutation,
  useRemoveFromCartMutation,
} from '../../../services/api';
import { cartStyles } from './CartStyles';

const CartScreen = () => {
  const cartQuery = useGetCartQuery();
  const cartData: any = cartQuery.data;
  const cartItems = Array.isArray(cartData) ? cartData : cartData?.items ?? [];
  const isCartLoading = cartQuery.isLoading;
  const [updateQuantity] = useUpdateCartQuantityMutation();
  const [removeFromCart] = useRemoveFromCartMutation();

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
                    productId: item.productId || item._id,
                    quantity: item.quantity - 1,
                  });
                } else {
                  await removeFromCart({
                    productId: item.productId || item._id,
                  });
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
                  productId: item.productId || item._id,
                  quantity: item.quantity + 1,
                });
              }}
            >
              <Text style={cartStyles.btnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={async () => {
              await removeFromCart({ productId: item.productId || item._id });
            }}
            style={cartStyles.removeBtn}
          >
            <Text style={cartStyles.removeText}>Remove</Text>
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
      <FlatList
        data={cartItems}
        keyExtractor={(item, index) =>
          (item._id || item.productId || index).toString()
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={cartStyles.emptyContainer}>
            <Text style={cartStyles.empty}>Your cart is empty! 🛒</Text>
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
    </View>
  );
};

export default CartScreen;
