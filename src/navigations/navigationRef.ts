import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export const openNotificationsFromAnywhere = () => {
  if (!navigationRef.isReady()) return;

  // notificationsScreen is registered in Drawer navigator.
  navigationRef.navigate('MainDrawer', {
    screen: 'notificationsScreen',
  });
};

