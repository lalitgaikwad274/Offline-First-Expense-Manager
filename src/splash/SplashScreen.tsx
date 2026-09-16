import React, {useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  Dimensions
} from 'react-native';
import LottieView from 'lottie-react-native';

const {width, height} = Dimensions.get('window');
type SplashScreenProps = {
  onFinish?: () => void;
};

const SplashScreen = ({onFinish}: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7FBFC"
        translucent
      />

      <Image
        source={require('../Assets/images/splash.png')}
        style={styles.splashImage}
        resizeMode="cover"
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  topRedCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FF6B6B',
    opacity: 0.45,
    top: -70,
    left: -40,
  },

  topGreenCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#63E6BE',
    opacity: 0.35,
    top: -30,
    right: -40,
  },

  bottomBlueCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1597BB',
    opacity: 0.4,
    bottom: -80,
    left: -50,
  },

  bottomGreenCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#63E6BE',
    opacity: 0.35,
    bottom: -40,
    right: -50,
  },

  splashImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  animation: {
    width: 280,
    height: 280,
  },

  textContainer: {
    alignItems: 'center',
    marginTop: -10,
  },

  title: {
    fontSize: 38,
    lineHeight: 40,
    fontWeight: '800',
    color: '#0E2A47',
  },

  titleRed: {
    fontSize: 38,
    lineHeight: 40,
    fontWeight: '800',
    color: '#F83245',
  },

  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#263B53',
    marginTop: 3,
  },

  loadingContainer: {
    position: 'absolute',
    bottom: 45,
    alignItems: 'center',
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F83245',
    marginBottom: 8,
  },

  loadingText: {
    fontSize: 12,
    color: '#718096',
  },
});