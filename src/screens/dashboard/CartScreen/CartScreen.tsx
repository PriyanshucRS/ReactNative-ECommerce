import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectedItems,
  fetchCartStart,
  updateQuantityStart,
  removeFromCartStart,
} from '../../../store/slices/cartSlice';
import { cartStyles } from './CartStyles';

const CartScreen = () => {
  const cartItems = useSelector(selectedItems);
  const dispatch = useDispatch();
  const cartState = useSelector((state: any) => state.cart);

  useEffect(() => {
    dispatch(fetchCartStart());
  }, [dispatch]);

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
          {/* Plus/Minus Buttons */}
          <View style={cartStyles.counterContainer}>
            <TouchableOpacity
              style={cartStyles.btnAction}
              onPress={() => {
                if (item.quantity > 1) {
                  dispatch(
                    updateQuantityStart({
                      productId: item.productId,
                      quantity: item.quantity - 1,
                    }),
                  );
                } else {
                  dispatch(removeFromCartStart({ productId: item.productId }));
                }
              }}
            >
              <Text style={cartStyles.btnText}>-</Text>
            </TouchableOpacity>

            <Text style={cartStyles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={cartStyles.btnAction}
              onPress={() =>
                dispatch(
                  updateQuantityStart({
                    productId: item.productId,
                    quantity: item.quantity + 1,
                  }),
                )
              }
            >
              <Text style={cartStyles.btnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            onPress={() =>
              dispatch(removeFromCartStart({ productId: item.productId }))
            }
            style={cartStyles.removeBtn}
          >
            <Text style={cartStyles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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

      {cartItems.length > 0 && !cartState.loading && (
        <View style={cartStyles.footer}>
          <View style={cartStyles.totalRow}>
            <Text style={cartStyles.totalLabel}>Total Amount</Text>
            <Text style={cartStyles.totalAmount}>
              ₹{totalPrice.toLocaleString()}
            </Text>
          </View>
        </View>
      )}
      {cartState.loading && (
        <View style={cartStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading cart...</Text>
        </View>
      )}
    </View>
  );
};

export default CartScreen;
