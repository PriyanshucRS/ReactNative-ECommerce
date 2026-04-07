import React from 'react';
import {
  FlatList,
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {
  useGetWishlistQuery,
  useToggleWishlistMutation,
} from '../../../services/wishlistApi';
import { styles } from './WatchlistStyles';
import { getFallbackKey, getProductId } from '../../../utils/helpers';
import BottomTabs from '../../../components/BottomTabs';
import type { RootState } from '../../../store/store';

const WatchlistScreen = () => {
  const navigation = useNavigation<any>();
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.user);
  const { data: wishlistData, isLoading } = useGetWishlistQuery(undefined, {
    skip: !isLoggedIn,
  });
  const [toggleWishlist] = useToggleWishlistMutation();
  const wishlist = isLoggedIn ? wishlistData || [] : [];

  const handleDelete = async (productId: string) => {
    Alert.alert(
      'Remove from Watchlist',
      'Remove this product from your watchlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await toggleWishlist({ productId }).unwrap();
              Alert.alert('Success', 'Removed from watchlist!');
            } catch (err: any) {
              Alert.alert('Error', err?.data?.message || 'Failed to remove');
            }
          },
        },
      ],
    );
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={[styles.card, { width: '100%' }]}>
      <View style={styles.Imgcontainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </View>

      <View style={styles.contentBox}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {item.title || item.name}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(getProductId(item))}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('homeScreen')}
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      <FlatList
        data={wishlist}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 86 }}
        keyExtractor={getFallbackKey}
        renderItem={renderProduct}
        numColumns={1}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#9CA3AF" />
            <Text style={styles.empty}>
              {isLoggedIn
                ? 'No products in watchlist yet!'
                : 'Login to view watchlist.'}
            </Text>
          </View>
        }
      />
      <BottomTabs activeTab="watchlist" />
    </View>
  );
};

export default WatchlistScreen;
