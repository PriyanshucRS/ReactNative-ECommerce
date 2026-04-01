import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './HeaderStyles';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../utils/colors';

export const HeaderScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.spacer} />

        <View style={styles.titleRow}>
          <Image
            source={require('../../../assets/main_logo.jpg')}
            style={styles.logo}
          />
          <Text style={styles.Title}>Let's Go Shopping!</Text>
        </View>

        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu-outline" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
