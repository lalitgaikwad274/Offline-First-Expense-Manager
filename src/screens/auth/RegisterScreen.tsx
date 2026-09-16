import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from '@react-native-firebase/auth';
import { scalePxToDP } from '../../utils/responsive';


const COLORS = {
  mint: '#B8F3DC',
  mintDark: '#25DCC0',
  petrol: '#07566A',
  navy: '#092C3A',
  red: '#FF4B55',
  white: '#FFFFFF',
  background: '#F4FFFB',
  text: '#092C3A',
  placeholder: '#8CA2AA',
};

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  // const handleRegister = () => {
  //   if (!name || !email || !password || !confirmPassword) {
  //     return;
  //   }

  //   if (password !== confirmPassword) {
  //     return;
  //   }

  //   // TODO: Register API / local database logic
  //   console.log({
  //     name,
  //     email,
  //     password,
  //   });
  // };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Error',
        'Password must be at least 6 characters',
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const auth = getAuth();
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
      }

      Alert.alert(
        'Account Created',
        'Your account has been created successfully.',
      );
    } catch (error: any) {
      console.error('Registration Failed', error);
      let errorMessage = 'Unable to create account. Please try again.';
      if (error?.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use.';
      } else if (error?.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error?.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak. Please use a stronger password.';
      } else if (error?.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (
        error?.code === 'auth/configuration-not-found' ||
        error?.message?.includes('CONFIGURATION_NOT_FOUND')
      ) {
        errorMessage =
          'Email/Password sign-in is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      Alert.alert(
        'Registration Failed',
        errorMessage,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#092C3A', '#07566A', '#0A7180']}
      style={styles.container}>
      {/* Decorative Glass / Clay Circles */}
      <View style={styles.topMintCircle}>
        <LinearGradient
          colors={[
            'rgba(184,243,220,0.55)',
            'rgba(37,220,192,0.18)',
          ]}
        // style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={styles.topRightCircle}>
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.22)',
            'rgba(37,220,192,0.08)',
          ]}
        // style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={styles.bottomCircle} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation?.goBack?.()}>
                <Image source={require('../../Assets/icons/back.png')}
                  style={{
                    height: scalePxToDP(24),
                    width: scalePxToDP(24),
                  }}
                />
              </TouchableOpacity>

              <View>
                <Text style={styles.title}>
                  Create <Text style={styles.titleAccent}>Account</Text>
                </Text>

                <Text style={styles.subtitle}>
                  Start managing your expenses smarter
                </Text>
              </View>
            </View>

            {/* Register Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Let's get started 👋</Text>

              <Text style={styles.cardSubtitle}>
                Create your account to continue
              </Text>

              {/* Name */}
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <Image
                    source={require('../../Assets/icons/user.png')}
                    style={{
                      height: scalePxToDP(18),
                      width: scalePxToDP(18),
                    }}
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor={COLORS.placeholder}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <Image
                    source={require('../../Assets/icons/mail.png')}
                    style={{
                      height: scalePxToDP(18),
                      width: scalePxToDP(18),
                    }}
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={COLORS.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <Image
                    source={require('../../Assets/icons/padlock.png')}
                    style={{
                      height: scalePxToDP(18),
                      width: scalePxToDP(18),
                    }}
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={COLORS.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}>
                  <Image
                    source={showConfirmPassword ? require('../../Assets/icons/see.png') : require('../../Assets/icons/not-visible.png')}
                    style={{
                      height: scalePxToDP(18),
                      width: scalePxToDP(18),
                    }}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <Image
                    source={require('../../Assets/icons/padlock.png')}
                    style={{
                      height: scalePxToDP(18),
                      width: scalePxToDP(18),
                    }}
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor={COLORS.placeholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }>
                  <Image
                    source={showConfirmPassword ? require('../../Assets/icons/see.png') : require('../../Assets/icons/not-visible.png')}
                    style={{
                      height: scalePxToDP(18),
                      width: scalePxToDP(18),
                    }}
                  />
                </TouchableOpacity>
              </View>

              {/* Terms */}
              <TouchableOpacity
                style={styles.termsRow}
                activeOpacity={0.8}
                onPress={() => setAgree(!agree)}>
                <View
                  style={[
                    styles.checkbox,
                    agree && styles.checkboxSelected,
                  ]}>
                  {agree && (
                    <Image
                      source={require('../../Assets/icons/check-mark.png')}
                      style={{
                        height: scalePxToDP(16),
                        width: scalePxToDP(16),
                        resizeMode: "contain",
                        tintColor: "#FFF",
                      }}
                    />
                  )}
                </View>

                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms & Conditions</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Register Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.buttonWrapper}
                onPress={handleRegister}>
                <LinearGradient
                  colors={['#FF5D65', '#FF4B55', '#E83E48']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.registerButton}>
                  <Text style={styles.registerButtonText}>
                    Create Account
                  </Text>

                  <Image
                    source={require('../../Assets/icons/add-user.png')}
                    style={{
                      height: scalePxToDP(24),
                      width: scalePxToDP(24),
                      resizeMode: "contain",
                      tintColor: "#FFF"
                    }}
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />

                <Text style={styles.orText}>Or continue with</Text>

                <View style={styles.divider} />
              </View>

              {/* Social Buttons */}
              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require('../../Assets/icons/google.webp')}
                    style={{
                      height: scalePxToDP(50),
                      width: scalePxToDP(50),
                    }}
                  />
                  <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require('../../Assets/icons/apple.webp')}
                    style={{
                      height: scalePxToDP(30),
                      width: scalePxToDP(30),
                    }}
                  />
                  <Text style={styles.socialText}>Apple</Text>
                </TouchableOpacity>
              </View>

              {/* Login */}
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>
                  Already have an account?
                </Text>

                <TouchableOpacity
                  onPress={() => navigation?.navigate?.('Login')}>
                  <Text style={styles.loginLink}> Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },

  safeArea: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    // paddingHorizontal: 22,
    paddingTop: 12,
    // paddingBottom: 35,
  },

  /* Decorative shapes */

  topMintCircle: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    top: -125,
    left: -95,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',

    shadowColor: '#25DCC0',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
  },

  topRightCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    top: 55,
    right: -95,
    backgroundColor: 'rgba(184,243,220,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  bottomCircle: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: -160,
    left: -90,
    backgroundColor: 'rgba(184,243,220,0.12)',
    zIndex: 11
  },

  /* Header */

  header: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,

    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',

    shadowColor: '#000',
    shadowOffset: {
      width: 3,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },

  title: {
    color: COLORS.white,
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -0.7,
  },

  titleAccent: {
    color: COLORS.mint,
  },

  subtitle: {
    marginTop: 7,
    color: 'rgba(255,255,255,0.68)',
    fontSize: 14,
    lineHeight: 21,
  },

  /* Main Clay Card */

  card: {
    flex: 1,
    backgroundColor: '#F7FFFC',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 25,

    shadowColor: '#021D27',
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.30,
    shadowRadius: 28,
    elevation: 15,
  },

  cardTitle: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: '800',
  },

  cardSubtitle: {
    color: '#789099',
    fontSize: 13,
    marginTop: 5,
    marginBottom: 21,
  },

  /* Inputs */

  inputWrapper: {
    height: 59,
    borderRadius: 18,
    backgroundColor: '#F2FBF8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 13,

    borderWidth: 1,
    borderColor: 'rgba(7,86,106,0.07)',

    shadowColor: '#07566A',
    shadowOffset: {
      width: 3,
      height: 4,
    },
    shadowOpacity: 0.09,
    shadowRadius: 7,
    elevation: 3,
  },

  iconContainer: {
    width: 35,
    height: 35,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
    backgroundColor: '#E1F7F0',
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },

  /* Terms */

  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 3,
    marginBottom: 19,
  },

  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#B8C9CE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
    marginTop: 1,
  },

  checkboxSelected: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },

  termsText: {
    flex: 1,
    color: '#71868D',
    fontSize: 12,
    lineHeight: 18,
  },

  termsLink: {
    color: COLORS.red,
    fontWeight: '700',
  },

  /* Button */

  buttonWrapper: {
    borderRadius: 18,

    shadowColor: COLORS.red,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.27,
    shadowRadius: 12,
    elevation: 7,
  },

  registerButton: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  registerButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    marginRight: 9,
  },

  /* Divider */

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDE9E6',
  },

  orText: {
    marginHorizontal: 10,
    color: '#91A1A5',
    fontSize: 11,
  },

  /* Social */

  socialContainer: {
    flexDirection: 'row',
    gap: 11,
  },

  socialButton: {
    flex: 1,
    height: 51,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#E0EBE8',

    shadowColor: '#07566A',
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
  },

  googleG: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4285F4',
    marginRight: 8,
  },

  socialText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '700',
  },

  /* Login */

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 23,
  },

  loginText: {
    color: '#7B8E94',
    fontSize: 12,
  },

  loginLink: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: '800',
  },
});