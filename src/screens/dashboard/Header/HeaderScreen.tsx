import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './HeaderStyles';
import { colors } from '../../../utils/colors';

type HeaderScreenProps = {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  searchOpen?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onSearchClose?: () => void;
};

export const HeaderScreen = ({
  onSearchPress,
  onNotificationPress,
  searchOpen = false,
  searchQuery = '',
  onSearchChange,
  onSearchClose,
}: HeaderScreenProps) => {
  // Header search is controlled by parent (HomeScreen).
  // Drawer navigation icon will be rendered below the header.

  return (
    <View>
      <View style={styles.headerRow}>
        {searchOpen ? (
          <View style={styles.headerSearchWrap}>
            <TextInput
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Search by title, category or price"
              placeholderTextColor={colors.textPlaceholder}
              style={styles.headerSearchInput}
              autoCapitalize="none"
              autoFocus
            />
            <TouchableOpacity
              style={styles.headerSearchCloseBtn}
              onPress={onSearchClose}
            >
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.titleRow}>
              <Image
                source={require('../../../assets/main_logo.jpg')}
                style={styles.logo}
              />
              <Text style={styles.Title}>Let's Go Shopping!</Text>
            </View>

            <View style={styles.rightIcons}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={
                  onNotificationPress ||
                  (() => Alert.alert('Notifications', 'Coming soon'))
                }
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
                <Ionicons
                  name="search-outline"
                  size={22}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};
