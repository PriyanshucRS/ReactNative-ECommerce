import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigations/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { store } from './src/store/store';
import notifee, { EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import {
  initializeNotificationHandlers,
  requestNotificationPermission,
} from './src/services/notificationService';
import {
  navigationRef,
  openNotificationsFromAnywhere,
} from './src/navigations/navigationRef';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

setupListeners(store.dispatch);

const App = () => {
  useEffect(() => {
    const bootstrapNotifications = async () => {
      try {
        await requestNotificationPermission();
        await initializeNotificationHandlers();
      } catch {
        // Notification setup should not block app startup.
      }
    };
    bootstrapNotifications();
  }, []);

  useEffect(() => {
    const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        openNotificationsFromAnywhere({
          title: detail?.notification?.title,
          body: detail?.notification?.body,
          notificationId: detail?.notification?.data?.notificationId
            ? String(detail?.notification?.data?.notificationId)
            : undefined,
        });
      }
    });

    const unsubscribeOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      openNotificationsFromAnywhere({
        title: remoteMessage?.notification?.title,
        body: remoteMessage?.notification?.body,
        notificationId: remoteMessage?.data?.notificationId
          ? String(remoteMessage?.data?.notificationId)
          : undefined,
      });
    });

    messaging()
      .getInitialNotification()
      .then(initialMessage => {
        if (initialMessage) {
          openNotificationsFromAnywhere({
            title: initialMessage?.notification?.title,
            body: initialMessage?.notification?.body,
            notificationId: initialMessage?.data?.notificationId
              ? String(initialMessage?.data?.notificationId)
              : undefined,
          });
        }
      })
      .catch(() => {});

    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <NavigationContainer ref={navigationRef}>
              <AppNavigator />
            </NavigationContainer>
          </SafeAreaView>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

export default App;
