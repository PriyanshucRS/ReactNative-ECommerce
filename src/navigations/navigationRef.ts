import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export type NotificationPreviewPayload = {
  title?: string;
  body?: string;
  notificationId?: string;
  openedFromPush?: boolean;
};

export const openNotificationsFromAnywhere = (
  payload?: NotificationPreviewPayload,
) => {
  if (!navigationRef.isReady()) return;

  // notificationsScreen is registered in Drawer navigator.
  navigationRef.navigate('MainDrawer', {
    screen: 'notificationsScreen',
    params: {
      ...payload,
      openedFromPush: !!(payload?.title || payload?.body),
    },
  });
};

