import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { SCREEN_NAMES } from '../utils/screenNames';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={SCREEN_NAMES.LOGIN}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name= {SCREEN_NAMES.LOGIN}
        component={LoginScreen}
      />

      <Stack.Screen
        name= {SCREEN_NAMES.REGISTER}
        component={RegisterScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;