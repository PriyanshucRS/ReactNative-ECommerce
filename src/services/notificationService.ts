import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const ANDROID_CHANNEL_ID = 'welcome_channel';
const ANDROID_SOUND_NAME = 'notification_sound';
const HIGH_IMPORTANCE = 4; // AndroidImportance.HIGH

let foregroundUnsubscribe: undefined | (() => void);

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
    id: ANDROID_CHANNEL_ID,
    name: 'Welcome Notifications',
    importance: HIGH_IMPORTANCE,
    sound: ANDROID_SOUND_NAME,
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
  const currentUser = auth().currentUser;
  if (!currentUser) return;
  try {
    await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('notifications')
      .add({
        title,
        body,
        read: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
        source: 'local',
      });
  } catch (error: any) {
    // Non-blocking: local/system notification should still work
    // even if Firestore rules/index/db state is not ready.
    console.warn('[Notification] Firestore save skipped', {
      code: error?.code,
      message: error?.message,
    });
  }
};

export const showWelcomeNotification = async (fullName: string) => {
  const notifee = getNotifee();
  if (!notifee) return;
  await createAndroidChannel();
  const title = 'Welcome';
  const body = `Welcome ${fullName}! Glad to see you again.`;

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: ANDROID_CHANNEL_ID,
      importance: HIGH_IMPORTANCE,
      pressAction: { id: 'default' },
      sound: ANDROID_SOUND_NAME,
      smallIcon: 'ic_launcher',
    },
  });

  await saveNotificationForCurrentUser(title, body);
};

export const initializeNotificationHandlers = async () => {
  const notifee = getNotifee();
  if (!notifee) return;
  await createAndroidChannel();

  if (!foregroundUnsubscribe) {
    foregroundUnsubscribe = messaging().onMessage(async remoteMessage => {
      const title = remoteMessage.notification?.title || 'Notification';
      const body = remoteMessage.notification?.body || '';

      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId: ANDROID_CHANNEL_ID,
          importance: HIGH_IMPORTANCE,
          pressAction: { id: 'default' },
          sound: ANDROID_SOUND_NAME,
          smallIcon: 'ic_launcher',
        },
      });

      await saveNotificationForCurrentUser(title, body);
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

    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: ANDROID_CHANNEL_ID,
        importance: HIGH_IMPORTANCE,
        pressAction: { id: 'default' },
        sound: ANDROID_SOUND_NAME,
        smallIcon: 'ic_launcher',
      },
    });

    await saveNotificationForCurrentUser(title, body);
  });
};

