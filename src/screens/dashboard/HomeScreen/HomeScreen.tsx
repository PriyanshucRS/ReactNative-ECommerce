import { FlatList, View, Image, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { PRODUCTS } from '../../../utils/contants';
import { useNavigation } from '@react-navigation/native';
import { HeaderScreen } from '../Header/HeaderScreen';
import { styles } from './HomeStyles';

const HomeScreen = ({}) => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <HeaderScreen />
      <FlatList
        data={PRODUCTS}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
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
              <Image source={item.image} style={styles.image} />
            </View>

            <View style={styles.contentBox}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
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
