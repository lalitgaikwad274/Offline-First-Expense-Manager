import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuth, onAuthStateChanged, User } from '@react-native-firebase/auth';

import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { COLORS } from '../utils/colors';
import SplashScreen from '../splash/SplashScreen';

type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <NavigationContainer>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.mintLight,
  },
});

export default RootNavigator;