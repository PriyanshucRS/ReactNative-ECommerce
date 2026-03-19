import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectedItems, removeCart } from '../../../redux/cartSlice';
import { cartStyles } from './CartStyles';

const CartScreen = () => {
  const cartItems = useSelector(selectedItems);
  const dispatch = useDispatch();

  return (
    <View style={cartStyles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item, index) => item.id + index}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={cartStyles.cartItem}>
            <View style={cartStyles.imgBox}>
              <Image source={item.image} style={cartStyles.img} />
            </View>

            <View style={cartStyles.info}>
              <Text style={cartStyles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={cartStyles.price}>
                ₹{item.price.toLocaleString()}
              </Text>
              <Text style={cartStyles.category}>{item.category}</Text>
              <Text style={cartStyles.desc} numberOfLines={2}>
                {item.description}
              </Text>
              <TouchableOpacity
                onPress={() => dispatch(removeCart(item))}
                style={cartStyles.removeBtn}
              >
                <Text style={cartStyles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={cartStyles.emptyContainer}>
            <Text style={cartStyles.empty}>Your cart is empty! 🛒</Text>
          </View>
        }
      />
    </View>
  );
};

export default CartScreen;
