import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectedItems,
  removeCart,
  increment,
  decrement,
} from '../../../store/slices/cartSlice';
import { cartStyles } from './CartStyles';

const CartScreen = () => {
  const cartItems = useSelector(selectedItems);
  const dispatch = useDispatch();

  const totalPrice = cartItems.reduce(
    (total: number, item: any) => total + item.price * item.quantity,
    0,
  );

  const renderItem = ({ item }: any) => (
    <View style={cartStyles.cartItem}>
      <View style={cartStyles.imgBox}>
        <Image source={item.image} style={cartStyles.img} />
      </View>

      <View style={cartStyles.info}>
        <Text style={cartStyles.name} numberOfLines={1}>
          {item.name}
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
              onPress={() => dispatch(decrement(item.id))}
            >
              <Text style={cartStyles.btnText}>-</Text>
            </TouchableOpacity>

            <Text style={cartStyles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={cartStyles.btnAction}
              onPress={() => dispatch(increment(item.id))}
            >
              <Text style={cartStyles.btnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            onPress={() => dispatch(removeCart(item.id))}
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
        keyExtractor={item => item.id.toString()}
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
          {/* <TouchableOpacity style={cartStyles.checkoutBtn}>
            <Text style={cartStyles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity> */}
        </View>
      )}
    </View>
  );
};

export default CartScreen;
