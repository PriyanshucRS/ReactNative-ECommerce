import 'react-native-gesture-handler/jestSetup';

/* global jest */

jest.mock('react-native-gesture-handler', () => {
  return {
    GestureHandlerRootView: ({ children }) => children,
    Directions: {},
    State: {},
    PanGestureHandler: ({ children }) => children,
    TapGestureHandler: ({ children }) => children,
    LongPressGestureHandler: ({ children }) => children,
    FlingGestureHandler: ({ children }) => children,
    ForceTouchGestureHandler: ({ children }) => children,
    NativeViewGestureHandler: ({ children }) => children,
    RawButton: ({ children }) => children,
  };
});
