import {
  FlatList,
  View,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  Pressable,
  Modal,
} from 'react-native';
import React, { useMemo, useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useGetProductsQuery } from '../../../services/api';
import {
  useGetWishlistQuery,
  useToggleWishlistMutation,
} from '../../../services/wishlistApi';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleFavorite,
  setFavorites,
  selectFavorites,
} from '../../../slices/wishlistSlice';
import type { RootState } from '../../../store/store';
import { HeaderScreen } from '../Header/HeaderScreen';
import { styles } from './HomeStyles';
import { getFallbackKey, getProductId } from '../../../utils/helpers';
import BottomTabs, {
  useBottomTabsContentPadding,
} from '../../../components/BottomTabs';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { colors } from '../../../utils/colors';
import { useGetNotificationsQuery } from '../../../services/notificationsApi';

const HomeScreen = () => {
  const toSafePrice = (value: unknown) => {
    const normalized = String(value ?? '')
      .replace(/[^0-9.]/g, '')
      .trim();
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const dispatch = useDispatch();
  const listBottomPadding = useBottomTabsContentPadding();
  const [toggleWishlist] = useToggleWishlistMutation();
  const favorites = useSelector(selectFavorites);
  const navigation = useNavigation<any>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    skip: !accessToken,
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | string>(
    'All',
  );
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(0);
  const { data: notifications = [] } = useGetNotificationsQuery(undefined, {
    skip: !accessToken,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const hasUnreadNotifications = useMemo(
    () => notifications.some((item: any) => !item?.read),
    [notifications],
  );

  const { data: allProductsData, isLoading } = useGetProductsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const products = useMemo(() => allProductsData || [], [allProductsData]);

  const priceStep = 500;

  const maxProductPrice = useMemo(() => {
    const prices = (allProductsData || [])
      .map((p: any) => toSafePrice(p?.price))
      .filter((n: number) => !Number.isNaN(n) && n >= 0);
    return prices.length ? Math.max(...prices) : 0;
  }, [allProductsData]);

  const maxSelectablePrice = useMemo(() => {
    // Round up to nearest 500 so slider `step={500}` always works.
    if (!maxProductPrice) return 0;
    return Math.ceil(maxProductPrice / priceStep) * priceStep;
  }, [maxProductPrice]);

  useEffect(() => {
    // Default: show all (max)
    setSelectedMaxPrice(maxSelectablePrice);
  }, [maxSelectablePrice]);

  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    (allProductsData || []).forEach((p: any) => {
      const c = (p?.category ?? '').toString().trim();
      const normalized = c.toLowerCase();
      if (c && !unique.has(normalized)) {
        unique.set(normalized, c);
      }
    });
    return ['All', ...Array.from(unique.values())];
  }, [allProductsData]);

  useEffect(() => {
    if (selectedCategory === 'All') return;
    const selectedNormalized = selectedCategory.toLowerCase().trim();
    const exists = categories.some(
      c => c.toLowerCase().trim() === selectedNormalized,
    );
    if (!exists) {
      setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

  const hasPricedProducts = maxSelectablePrice > 0;
  const sliderMaxValue = hasPricedProducts ? maxSelectablePrice : priceStep;

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const qNum = q ? Number(q) : NaN;
    const selectedCategoryNormalized = selectedCategory.toLowerCase().trim();

    return products.filter((p: any) => {
      const title = (p?.title || p?.name || '').toString().toLowerCase();
      const category = (p?.category || '').toString().toLowerCase();
      const price = toSafePrice(p?.price);
      const matchesCategory =
        selectedCategory === 'All' || category === selectedCategoryNormalized;
      const matchesPrice = selectedMaxPrice <= 0 || price <= selectedMaxPrice;

      const matchesSearch = !q
        ? true
        : title.includes(q) ||
          category.includes(q) ||
          (!Number.isNaN(qNum) &&
            (price === qNum || price.toString().includes(q)));

      return matchesCategory && matchesPrice && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory, selectedMaxPrice]);

  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (authUser) {
      setShowWelcome(true);
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [authUser]);

  useEffect(() => {
    if (!wishlistData) return;
    const favoriteIds = wishlistData.map(getProductId).filter(Boolean);
    dispatch(setFavorites(favoriteIds));
  }, [wishlistData, dispatch]);

  const handleWelcomeDismiss = () => {
    setShowWelcome(false);
  };

  const getFullName = () => {
    if (!authUser || !authUser.firstName || !authUser.lastName) {
      return 'User';
    }
    return `${authUser.firstName} ${authUser.lastName}`;
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('detailsScreen', { product: item })}
    >
      <TouchableOpacity
        style={styles.chatIconContainer}
        onPress={async e => {
          e.stopPropagation();
          if (!accessToken) {
            Alert.alert(
              'Login Required',
              'Watchlist me add karne ke liye pehle login karein.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'OK',
                  onPress: () =>
                    navigation.getParent()?.navigate('loginScreen'),
                },
              ],
            );
            return;
          }
          const productId = getProductId(item);
          try {
            await toggleWishlist({ productId }).unwrap();
            dispatch(toggleFavorite(productId));
          } catch {
            // Ignore noisy console logging in production UI flow.
          }
        }}
      >
        <Ionicons
          name={
            !!accessToken && favorites.includes(getProductId(item))
              ? 'heart'
              : 'heart-outline'
          }
          style={styles.chatIcon}
          color={
            !!accessToken && favorites.includes(getProductId(item))
              ? '#FF4444'
              : undefined
          }
        />
      </TouchableOpacity>
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
        </View>
      </View>
    </TouchableOpacity>
  );

  const skeletonItems = useMemo(
    () => Array.from({ length: 6 }, (_, index) => `skeleton-${index}`),
    [],
  );

  const renderSkeletonCard = ({ item }: { item: string }) => (
    <View key={item} style={styles.card}>
      <View style={styles.Imgcontainer}>
        <View style={styles.skeletonImage} />
      </View>
      <View style={styles.contentBox}>
        <View style={styles.skeletonCategory} />
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLineShort} />
        <View style={styles.priceRow}>
          <View style={styles.skeletonPrice} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderScreen
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClose={() => setSearchOpen(false)}
        showNotificationDot={hasUnreadNotifications}
        onNotificationPress={() =>
          navigation.navigate('notificationsScreen', {
            openedFromPush: false,
            title: undefined,
            body: undefined,
          })
        }
        onSearchPress={() => {
          setSearchOpen(prev => !prev);
          setFilterOpen(false);
        }}
      />
      {isLoading ? (
        <FlatList
          data={skeletonItems}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: listBottomPadding }}
          keyExtractor={item => item}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={renderSkeletonCard}
        />
      ) : (
        <>
          {filterOpen && (
            <Modal
              transparent
              visible={filterOpen}
              animationType="fade"
              onRequestClose={() => setFilterOpen(false)}
            >
              <Pressable
                style={styles.filterBackdrop}
                onPress={() => setFilterOpen(false)}
              >
                <View
                  style={styles.filterModalContainer}
                  pointerEvents="box-none"
                >
                  <Pressable style={styles.filterPanel} onPress={() => {}}>
                    <Text style={styles.filterTitle}>Filter</Text>

                    <View style={styles.filterRow}>
                      <Picker
                        selectedValue={selectedCategory}
                        onValueChange={value => {
                          setSelectedCategory(String(value));
                        }}
                        style={styles.picker}
                        mode="dialog"
                        dropdownIconColor={colors.textPrimary}
                        itemStyle={{ color: colors.textPrimary }}
                      >
                        {categories.map(cat => (
                          <Picker.Item key={cat} label={cat} value={cat} />
                        ))}
                      </Picker>
                    </View>

                    <View style={styles.sliderWrap}>
                      <Text style={styles.sliderValueText}>
                        {hasPricedProducts
                          ? `Up to ₹${selectedMaxPrice.toLocaleString()}`
                          : 'No priced products available'}
                      </Text>

                      <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={sliderMaxValue}
                        step={priceStep}
                        value={selectedMaxPrice}
                        onValueChange={setSelectedMaxPrice}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.border}
                        thumbTintColor={colors.primary}
                        disabled={!hasPricedProducts}
                      />
                    </View>

                    <View style={styles.filterActionRow}>
                      <TouchableOpacity
                        style={[styles.filterBtn, styles.resetBtn]}
                        onPress={() => {
                          setSearchQuery('');
                          setSelectedCategory('All');
                          setSelectedMaxPrice(maxSelectablePrice || 0);
                        }}
                      >
                        <Text style={styles.filterBtnText}>Reset</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.filterBtn, styles.applyBtn]}
                        onPress={() => {
                          setFilterOpen(false);
                        }}
                      >
                        <Text style={styles.filterBtnText}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>
          )}
          {showWelcome && authUser && (
            <View style={styles.welcome}>
              <Text style={styles.welcomeText}>Welcome {getFullName()}!</Text>
              <TouchableOpacity
                onPress={handleWelcomeDismiss}
                style={styles.welcomeText1}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.searchFilterRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                navigation.openDrawer();
              }}
            >
              <Ionicons
                name="navigate-outline"
                size={22}
                color={colors?.textPrimary ?? '#fff'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setFilterOpen(prev => !prev)}
            >
              <Ionicons
                name="options"
                size={22}
                color={colors?.textPrimary ?? '#fff'}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredProducts}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: listBottomPadding }}
            keyExtractor={getFallbackKey}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={renderProduct}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.empty}> No products added yet!</Text>
              </View>
            }
          />
          <BottomTabs activeTab="home" />
        </>
      )}
    </View>
  );
};

export default HomeScreen;
