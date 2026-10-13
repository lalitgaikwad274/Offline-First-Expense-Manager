import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuth, onAuthStateChanged, User } from '@react-native-firebase/auth';

import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { COLORS } from '../utils/colors';
import { moderateScale } from '../utils/responsive';
import SplashScreen from '../splash/SplashScreen';
import { IS_LOGGER_ENABLED } from '../utils/ApiConstants';
import { SCREEN_NAMES } from '../utils/screenNames';
import ApiDebuggerScreen from '../screens/debug/ApiDebuggerScreen';

export const navigationRef = createNavigationContainerRef<any>();

type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  ApiDebugger: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>();

  useEffect(() => {
    const auth = getAuth();
    const subscriber = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      if (initializing) {
        setInitializing(false);
      }
    });

    return subscriber;
  }, [initializing]);

  if (initializing || !splashFinished) {
    return <SplashScreen onFinish={() => setSplashFinished(true)} />;
  }

  const showLogger =
    IS_LOGGER_ENABLED && currentRouteName !== SCREEN_NAMES.API_DEBUGGER;

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        setCurrentRouteName(navigationRef.getCurrentRoute()?.name);
      }}
      onStateChange={() => {
        const route = navigationRef.getCurrentRoute();
        setCurrentRouteName(route?.name);
      }}>
      <View style={styles.container}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen
              name="App"
              component={AppNavigator}
            />
          ) : (
            <Stack.Screen
              name="Auth"
              component={AuthNavigator}
            />
          )}
          <Stack.Screen
            name={SCREEN_NAMES.API_DEBUGGER}
            component={ApiDebuggerScreen}
          />
        </Stack.Navigator>

        {showLogger && (
          <Pressable
            hitSlop={8}
            onPress={() => {
              if (navigationRef.isReady()) {
                navigationRef.navigate(SCREEN_NAMES.API_DEBUGGER);
              }
            }}
            style={({ pressed }) => [
              styles.loggerStyle,
              pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
            ]}>
            <Image
              source={require('../Assets/icons/bug.png')}
              style={styles.loggerIcon}
            />
          </Pressable>
        )}
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.mintLight,
  },
  loggerStyle: {
    backgroundColor: COLORS.expenseDark,
    padding: moderateScale(12),
    borderRadius: moderateScale(20),
    position: 'absolute',
    bottom: moderateScale(120),
    right: moderateScale(16),
    zIndex: 9999,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  loggerIcon: {
    height: moderateScale(24),
    width: moderateScale(24),
    resizeMode: 'contain',
    tintColor: COLORS.white
  },
});

export default RootNavigator;