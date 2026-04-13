import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './NotificationsStyles';
import { colors } from '../../../utils/colors';

type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt?: Date;
  read?: boolean;
};

const toDateSafe = (value: any): Date | undefined => {
  const maybe = value?.toDate?.();
  if (maybe instanceof Date) return maybe;
  const d = value instanceof Date ? value : undefined;
  return d;
};

const formatTime = (d?: Date) => {
  if (!d) return '';
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mm}`;
};

const NotificationsScreen = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const uid = user?.uid;
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      return;
    }

    setLoading(true);
    const ref = firestore()
      .collection('users')
      .doc(uid)
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(100);

    const unsub = ref.onSnapshot(
      snap => {
        const next: AppNotification[] = snap.docs.map(d => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: `${data?.title ?? 'Notification'}`,
            body: `${data?.body ?? ''}`,
            createdAt: toDateSafe(data?.createdAt),
            read: !!data?.read,
          };
        });
        setItems(next);
        setLoading(false);
      },
      () => {
        setItems([]);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [uid]);

  const emptyText = useMemo(() => {
    if (!uid) return 'Please login to view notifications.';
    if (loading) return '';
    return 'No notifications yet.';
  }, [uid, loading]);

  const markRead = async (id: string) => {
    if (!uid) return;
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .collection('notifications')
        .doc(id)
        .set({ read: true, readAt: firestore.FieldValue.serverTimestamp() }, { merge: true });
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>

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
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.read ? styles.cardUnread : null]}
              onPress={() => markRead(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardLeft}>
                <Ionicons
                  name={item.read ? 'notifications-outline' : 'notifications'}
                  size={20}
                  color={colors.textPrimary}
                />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardTime}>{formatTime(item.createdAt)}</Text>
                </View>
                {!!item.body && (
                  <Text style={styles.cardBodyText} numberOfLines={2}>
                    {item.body}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;

