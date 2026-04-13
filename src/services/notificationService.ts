import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import { API_BASE_URL } from '../constants/constants';
import { store } from '../store/store';
import notificationsApi from './notificationsApi';

const LOGIN_CHANNEL_ID = 'welcome_channel';
const APP_CHANNEL_ID = 'app_updates_channel';
const LOGIN_SOUND_NAME = 'notification_sound';
const APP_SOUND_NAME = 'notification_sound1';
const MAIN_LOGO_URI =
  Image.resolveAssetSource(require('../assets/main_logo.jpg')).uri || '';
const HIGH_IMPORTANCE = 4; // AndroidImportance.HIGH

let foregroundUnsubscribe: undefined | (() => void);

const getStyledNotificationMeta = (title: string) => {
  const normalized = `${title || ''}`.toLowerCase();

  if (normalized.includes('login')) {
    return { icon: '🎉', accent: '#22C55E' };
  }
  if (normalized.includes('cart')) {
    return { icon: '🛒', accent: '#3B82F6' };
  }
  if (normalized.includes('watchlist')) {
    return { icon: '💖', accent: '#F97316' };
  }
  if (normalized.includes('product')) {
    return { icon: '📦', accent: '#A855F7' };
  }
  return { icon: '🔔', accent: '#2563EB' };
};

const toStyledTitle = (title: string) => {
  const meta = getStyledNotificationMeta(title);
  return `${meta.icon} ${title}`;
};

const buildAndroidDisplay = (title: string, forceLoginSound = false) => {
  const meta = getStyledNotificationMeta(title);
  const isLoginNotification =
    forceLoginSound || `${title || ''}`.toLowerCase().includes('login');
  return {
    channelId: isLoginNotification ? LOGIN_CHANNEL_ID : APP_CHANNEL_ID,
    importance: HIGH_IMPORTANCE,
    pressAction: { id: 'default' },
    sound: isLoginNotification ? LOGIN_SOUND_NAME : APP_SOUND_NAME,
    smallIcon: 'ic_launcher',
    largeIcon: MAIN_LOGO_URI || 'ic_launcher',
    circularLargeIcon: true,
    color: meta.accent,
    showTimestamp: true,
    onlyAlertOnce: false,
    ongoing: false,
  };
};

const getNotifee = () => {
  try {
    // Lazy-load native module so app won't crash if build is stale.
    return require('@notifee/react-native').default;
  } catch {
    return null;
  }
};

const createAndroidChannel = async () => {
  const notifee = getNotifee();
  if (!notifee) return;

  await notifee.createChannel({
    id: LOGIN_CHANNEL_ID,
    name: 'Login Notifications',
    importance: HIGH_IMPORTANCE,
    sound: LOGIN_SOUND_NAME,
    vibration: true,
  });

  await notifee.createChannel({
    id: APP_CHANNEL_ID,
    name: 'App Notifications',
    importance: HIGH_IMPORTANCE,
    sound: APP_SOUND_NAME,
    vibration: true,
  });
};

export const requestNotificationPermission = async () => {
  await messaging().requestPermission();
  const notifee = getNotifee();
  if (notifee) {
    await notifee.requestPermission();
  }
};

export const syncFcmTokenForCurrentUser = async () => {
  const currentUser = auth().currentUser;
  if (!currentUser) return;

  const token = await messaging().getToken();
  if (!token) return;

  await firestore()
    .collection('users')
    .doc(currentUser.uid)
    .set(
      {
        fcmToken: token,
        notificationUpdatedAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
};

export const saveNotificationForCurrentUser = async (
  title: string,
  body: string,
) => {
  const payload = {
    title,
    body,
    source: 'local',
  };

  try {
    console.log('[Notification][Frontend] create start (rtk)', {
      title,
      hasBody: !!body,
    });
    const result = await store
      .dispatch(
        notificationsApi.endpoints.createNotification.initiate(payload),
      )
      .unwrap();

    console.log('[Notification][Frontend] create success (rtk)', {
      notificationId: (result as any)?.notification?._id || (result as any)?.notification?.id,
    });
    store.dispatch(notificationsApi.util.invalidateTags(['Notifications']));
    return (result as any)?.notification || null;
  } catch (error: any) {
    console.warn('[Notification][Frontend] create failed (rtk), trying fallback', {
      message: error?.message,
      data: error?.data,
    });
    // Fallback: direct request when RTK context is unavailable.
    try {
      const reduxToken = store.getState()?.auth?.accessToken;
      const token = reduxToken || (await AsyncStorage.getItem('token'));
      if (!token) throw new Error('missing-auth-token');

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const parsed = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(parsed?.message || 'notification-save-failed');
      }

      console.log('[Notification][Frontend] create success (fallback)', {
        notificationId: parsed?.notification?._id || parsed?.notification?.id,
      });
      store.dispatch(notificationsApi.util.invalidateTags(['Notifications']));
      return parsed?.notification || null;
    } catch (fallbackError: any) {
      console.warn('[Notification] Mongo save skipped', {
        message: fallbackError?.message || error?.message,
      });
      return null;
    }
  }
};

export const showWelcomeNotification = async (
  fullName: string,
  isFirstLogin = false,
) => {
  const notifee = getNotifee();
  if (!notifee) return;
  await createAndroidChannel();
  const cleanName = (fullName || 'User').trim() || 'User';
  const title = isFirstLogin ? '🎉 Welcome to AwesomeProject' : '👋 Welcome Back';
  const body = isFirstLogin
    ? `Hello <b>${cleanName}</b>!\nYour account is ready. Start exploring now.`
    : `Welcome back, <b>${cleanName}</b>!\nYou are now signed in and ready to explore.`;
  const saved = await saveNotificationForCurrentUser(title, body);
  const notificationId = saved?._id || saved?.id;

  await notifee.displayNotification({
    title: toStyledTitle(title),
    body,
    data: notificationId ? { notificationId: String(notificationId) } : undefined,
    android: buildAndroidDisplay(title, true),
  });
};

export const showAppNotification = async (title: string, body: string) => {
  const saved = await saveNotificationForCurrentUser(title, body);
  const notificationId = saved?._id || saved?.id;
  const notifee = getNotifee();
  if (notifee) {
    await createAndroidChannel();
    await notifee.displayNotification({
      title: toStyledTitle(title),
      body,
      data: notificationId ? { notificationId: String(notificationId) } : undefined,
      android: buildAndroidDisplay(title),
    });
  }
};

export const initializeNotificationHandlers = async () => {
  const notifee = getNotifee();
  if (!notifee) return;
  await createAndroidChannel();

  if (!foregroundUnsubscribe) {
    foregroundUnsubscribe = messaging().onMessage(async remoteMessage => {
      const title = remoteMessage.notification?.title || 'Notification';
      const body = remoteMessage.notification?.body || '';
      const saved = await saveNotificationForCurrentUser(title, body);
      const notificationId = saved?._id || saved?.id;

      await notifee.displayNotification({
        title: toStyledTitle(title),
        body,
        data: notificationId ? { notificationId: String(notificationId) } : undefined,
        android: buildAndroidDisplay(title),
      });
    });
  }
};

export const registerBackgroundNotificationHandler = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    const notifee = getNotifee();
    if (!notifee) return;
    await createAndroidChannel();
    const title = remoteMessage.notification?.title || 'Notification';
    const body = remoteMessage.notification?.body || '';
    const saved = await saveNotificationForCurrentUser(title, body);
    const notificationId = saved?._id || saved?.id;

    await notifee.displayNotification({
      title: toStyledTitle(title),
      body,
      data: notificationId ? { notificationId: String(notificationId) } : undefined,
      android: buildAndroidDisplay(title),
    });
  });
};

