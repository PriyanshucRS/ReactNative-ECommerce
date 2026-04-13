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
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {
  useGetWishlistQuery,
  useToggleWishlistMutation,
} from '../../../services/wishlistApi';
import { useGetProductsQuery } from '../../../services/productsApi';
import { styles } from './WatchlistStyles';
import { getFallbackKey, getProductId } from '../../../utils/helpers';
import { showAppNotification } from '../../../services/notificationService';
import BottomTabs, {
  useBottomTabsContentPadding,
} from '../../../components/BottomTabs';
import type { RootState } from '../../../store/store';

const WatchlistScreen = () => {
  const navigation = useNavigation<any>();
  const listBottomPadding = useBottomTabsContentPadding();
  const isFocused = useIsFocused();
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.user);
  const { data: allProducts = [] } = useGetProductsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const availableProductIds = new Set(
    allProducts.map(p => p.id || p._id).filter(Boolean) as string[],
  );
  const {
    data: wishlistData,
    isLoading,
    refetch,
  } = useGetWishlistQuery(undefined, {
    skip: !isLoggedIn,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  React.useEffect(() => {
    if (isFocused && isLoggedIn) refetch();
  }, [isFocused, isLoggedIn, refetch]);
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
              await showAppNotification(
                '💖 Watchlist Updated',
                '<b>An item</b> has been removed from your watchlist.',
              );
              Alert.alert('Success', 'Removed from watchlist!');
            } catch (err: any) {
              Alert.alert('Error', err?.data?.message || 'Failed to remove');
            }
          },
        },
      ],
    );
  };

  const renderProduct = ({ item }: { item: any }) => {
    const isUnavailable =
      item.unavailable || !availableProductIds.has(getProductId(item));

    return (
      <View
        style={[
          styles.card,
          { width: '100%' },
          isUnavailable && styles.unavailableCard,
        ]}
      >
        <View style={styles.Imgcontainer}>
          <Image
            source={{ uri: item.image }}
            style={[styles.image, isUnavailable && { opacity: 0.45 }]}
          />
        </View>

        <View style={styles.contentBox}>
          <Text style={styles.category}>{item.category}</Text>
          <Text
            style={[styles.name, isUnavailable && { color: '#9CA3AF' }]}
            numberOfLines={1}
          >
            {item.title || item.name}
          </Text>
          {isUnavailable && (
            <Text style={[styles.category, { color: '#2563EB', marginTop: 4 }]}>
              Unavailable (deleted)
            </Text>
          )}
          <Text style={styles.desc} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
            <TouchableOpacity
              style={[styles.deleteBtn, isUnavailable && { opacity: 0.65 }]}
              onPress={() => handleDelete(getProductId(item))}
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
        onPress={() =>
          navigation
            .getParent()
            ?.navigate('MainDrawer', { screen: 'homeScreen' })
        }
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      <FlatList
        data={wishlist}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: listBottomPadding }}
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
