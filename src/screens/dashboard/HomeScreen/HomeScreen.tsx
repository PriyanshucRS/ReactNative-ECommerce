import { FlatList, View, Image, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductsStart } from '../../../store/slices/addProductSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import { PRODUCTS } from '../../../utils/contants';
import { useNavigation } from '@react-navigation/native';
import { HeaderScreen } from '../Header/HeaderScreen';
import { styles } from './HomeStyles';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({}) => {
  const navigation = useNavigation<any>();
  const authUser = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();
  const addProductState = useSelector(
    (state: any) => state.addProduct.products,
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchProductsStart());
    }, [dispatch]),
  );

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

  const handleWelcomeDismiss = () => {
    setShowWelcome(false);
  };

  const getFullName = () => {
    if (!authUser) return '';
    return `${authUser.firstName} ${authUser.lastName}`;
  };

  return (
    <View style={styles.container}>
      <HeaderScreen />
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
      <FlatList
        data={addProductState || []}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item._id || item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('detailsScreen', { product: item })
            }
          >
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
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}> No products added yet!</Text>
          </View>
        }
      />
    </View>
  );
};

export default HomeScreen;
