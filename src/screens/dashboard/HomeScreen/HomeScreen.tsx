import {
  FlatList,
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useGetProductsQuery } from '../../../services/api';
import { HeaderScreen } from '../Header/HeaderScreen';
import { styles } from './HomeStyles';
import type { RootState } from '../../../store/store';

const HomeScreen = ({}) => {
  const navigation = useNavigation<any>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { data: products = [], isLoading } = useGetProductsQuery();

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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <HeaderScreen />
        <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
      </View>
    );
  }

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
        data={products}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderProduct}
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
