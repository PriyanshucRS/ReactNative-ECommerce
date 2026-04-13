import React, { useEffect } from 'react';
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
    const unsubscribeForeground = notifee.onForegroundEvent(({ type }) => {
      if (type === EventType.PRESS) {
        openNotificationsFromAnywhere();
      }
    });

    const unsubscribeOpened = messaging().onNotificationOpenedApp(() => {
      openNotificationsFromAnywhere();
    });

    messaging()
      .getInitialNotification()
      .then(initialMessage => {
        if (initialMessage) {
          openNotificationsFromAnywhere();
        }
      })
      .catch(() => {});

    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  }, []);

  return (
    <GestureHandlerRootView>
      <Provider store={store}>
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
