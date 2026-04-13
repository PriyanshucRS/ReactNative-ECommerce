import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Swipeable } from 'react-native-gesture-handler';
import { styles } from './NotificationsStyles';
import { colors } from '../../../utils/colors';
import {
  useCreateNotificationMutation,
  useClearAllNotificationsMutation,
  useDeleteNotificationMutation,
  useDeleteSelectedNotificationsMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from '../../../services/notificationsApi';

type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt?: Date;
  read?: boolean;
};

const stripSimpleHtml = (value: string) => value.replace(/<[^>]+>/g, '').trim();

const toDateSafe = (value: any): Date | undefined =>
  value instanceof Date ? value : undefined;

const formatTime = (d?: Date) => {
  if (!d) return '';
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mm}`;
};

const formatDateLabel = (d?: Date) => {
  if (!d) return '';
  const now = new Date();
  const sameDay = now.toDateString() === d.toDateString();
  if (sameDay) return 'Today';
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;
};

const getNotificationMeta = (title: string) => {
  const normalized = title.toLowerCase();
  if (normalized.includes('login')) {
    return {
      icon: 'shield-checkmark-outline',
      accent: '#22C55E',
      tag: 'Security',
    };
  }
  if (normalized.includes('cart')) {
    return { icon: 'cart-outline', accent: '#3B82F6', tag: 'Cart' };
  }
  if (normalized.includes('watchlist')) {
    return { icon: 'heart-outline', accent: '#F97316', tag: 'Watchlist' };
  }
  if (normalized.includes('product')) {
    return { icon: 'cube-outline', accent: '#A855F7', tag: 'Product' };
  }
  return { icon: 'notifications-outline', accent: '#3B82F6', tag: 'General' };
};

const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const openedFromPush = !!route.params?.openedFromPush;
  const openedNotificationId = route.params?.notificationId
    ? String(route.params?.notificationId)
    : '';
  const pressedTitle = openedFromPush ? route.params?.title : undefined;
  const pressedBody = openedFromPush
    ? stripSimpleHtml(`${route.params?.body ?? ''}`)
    : '';
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const uid = user?.uid || user?._id || (user as any)?.id;
  const {
    data: fetchedNotifications = [],
    isLoading: loading,
    refetch,
  } = useGetNotificationsQuery(undefined, {
    skip: !accessToken,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [markReadMutation] = useMarkNotificationReadMutation();
  const [createNotificationMutation] = useCreateNotificationMutation();
  const [deleteOneMutation] = useDeleteNotificationMutation();
  const [clearAllMutation] = useClearAllNotificationsMutation();
  const [deleteSelectedMutation] = useDeleteSelectedNotificationsMutation();

  const items = useMemo<AppNotification[]>(
    () =>
      fetchedNotifications.map((item: any) => ({
        id: item._id || item.id,
        title: `${item?.title ?? 'Notification'}`,
        body: stripSimpleHtml(`${item?.body ?? ''}`),
        createdAt: toDateSafe(
          item?.createdAt ? new Date(item.createdAt) : undefined,
        ),
        read: !!item?.read,
      })),
    [fetchedNotifications],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectionMode = selectedIds.length > 0;

  useEffect(() => {
    const title = `${pressedTitle || ''}`.trim();
    const body = `${pressedBody || ''}`.trim();
    if (!openedFromPush || openedNotificationId || !uid || (!title && !body)) {
      return;
    }

    const alreadyExists = items.some(
      item =>
        item.title.trim().toLowerCase() === title.toLowerCase() &&
        item.body.trim().toLowerCase() === body.toLowerCase(),
    );
    if (alreadyExists) return;

    const persistIncoming = async () => {
      try {
        await createNotificationMutation({
          title: title || 'Notification',
          body,
          source: 'push-open',
        }).unwrap();
        await refetch();
      } catch {
        // ignore - non-blocking preview remains visible
      }
    };
    persistIncoming();
    navigation.setParams({
      openedFromPush: false,
      title: undefined,
      body: undefined,
    });
  }, [
    openedFromPush,
    openedNotificationId,
    uid,
    pressedTitle,
    pressedBody,
    items,
    createNotificationMutation,
    navigation,
    refetch,
  ]);

  useEffect(() => {
    if (!openedFromPush || !openedNotificationId) return;
    refetch();
  }, [openedFromPush, openedNotificationId, refetch]);

  useEffect(() => {
    if (!isFocused || !accessToken) return;
    refetch();
  }, [isFocused, accessToken, refetch]);

  const emptyText = useMemo(() => {
    if (!uid) return 'Please login to view notifications.';
    if (loading) return '';
    return 'No notifications yet.';
  }, [uid, loading]);

  const markRead = async (id: string) => {
    if (!uid) return;
    try {
      await markReadMutation({ id }).unwrap();
      await refetch();
    } catch {
      // ignore
    }
  };

  const deleteNotification = async (id: string) => {
    if (!uid) return;
    try {
      await deleteOneMutation({ id }).unwrap();
      await refetch();
    } catch {
      // ignore
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const deleteSelected = async () => {
    if (!uid || selectedIds.length === 0) return;
    try {
      await deleteSelectedMutation({ ids: selectedIds }).unwrap();
      await refetch();
      setSelectedIds([]);
    } catch {
      // ignore
    }
  };

  const clearAllNotifications = async () => {
    if (!uid || items.length === 0) return;
    try {
      await clearAllMutation().unwrap();
      await refetch();
      setSelectedIds([]);
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation
                .getParent()
                ?.navigate('MainDrawer', { screen: 'homeScreen' })
            }
          >
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <View style={styles.headerActions}>
          {selectionMode ? (
            <>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={deleteSelected}
              >
                <Text style={styles.headerBtnText}>Delete Selected</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtnGhost}
                onPress={clearSelection}
              >
                <Text style={styles.headerBtnGhostText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={clearAllNotifications}
            >
              <Text style={styles.headerBtnText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {openedFromPush && !openedNotificationId && (pressedTitle || pressedBody) && (
        <View style={[styles.card, styles.cardUnread, styles.pressedCard]}>
          <View
            style={[
              styles.cardLeft,
              {
                backgroundColor: `${
                  getNotificationMeta(pressedTitle || 'Notification').accent
                }20`,
              },
            ]}
          >
            <Ionicons
              name={
                getNotificationMeta(pressedTitle || 'Notification').icon as any
              }
              size={20}
              color={getNotificationMeta(pressedTitle || 'Notification').accent}
            />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {pressedTitle || 'Notification'}
              </Text>
              <View style={styles.badgeUnread}>
                <Text style={styles.badgeUnreadText}>Unread</Text>
              </View>
            </View>
            <View style={styles.cardMetaRow}>
              <Text style={styles.cardMetaText}>
                {getNotificationMeta(pressedTitle || 'Notification').tag}
              </Text>
              <Text style={styles.cardTime}>Now</Text>
            </View>
            {!!pressedBody && (
              <Text style={styles.cardBodyText} numberOfLines={3}>
                {pressedBody}
              </Text>
            )}
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.textPrimary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={n => n.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const meta = getNotificationMeta(item.title);
            const rightAction = () => (
              <TouchableOpacity
                style={styles.swipeDeleteAction}
                onPress={() => deleteNotification(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                <Text style={styles.swipeDeleteText}>Delete</Text>
              </TouchableOpacity>
            );

            return (
              <Swipeable
                renderRightActions={rightAction}
                overshootRight={false}
                rightThreshold={30}
              >
                <TouchableOpacity
                  style={[
                    styles.card,
                    !item.read ? styles.cardUnread : null,
                    selectedIds.includes(item.id) ? styles.cardSelected : null,
                  ]}
                  onLongPress={() => toggleSelect(item.id)}
                  onPress={() => {
                    if (selectionMode) {
                      toggleSelect(item.id);
                      return;
                    }
                    markRead(item.id);
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.cardLeft,
                      { backgroundColor: `${meta.accent}20` },
                    ]}
                  >
                    <Ionicons
                      name={meta.icon as any}
                      size={20}
                      color={meta.accent}
                    />
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {item.read ? (
                        <View style={styles.badgeRead}>
                          <Text style={styles.badgeReadText}>Read</Text>
                        </View>
                      ) : (
                        <View style={styles.badgeUnread}>
                          <Text style={styles.badgeUnreadText}>Unread</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.cardMetaRow}>
                      <Text style={styles.cardMetaText}>{meta.tag}</Text>
                      <Text style={styles.cardTime}>
                        {formatDateLabel(item.createdAt)}{' '}
                        {formatTime(item.createdAt)}
                      </Text>
                    </View>
                    {!!item.body && (
                      <Text style={styles.cardBodyText} numberOfLines={3}>
                        {item.body}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </Swipeable>
            );
          }}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;
