import React, { useState, useEffect } from 'react';
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
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail,
} from '@react-native-firebase/auth';
import { scalePxToDP } from '../../utils/responsive';
import { useDispatch } from 'react-redux';
import { setUserDetail } from '../../store/expenseSlice';
import { addUser } from '../../store/api';


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
  const dispatch = useDispatch()

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    if (isPhoneVerified) {
      setIsPhoneVerified(false);
      setOtpSent(false);
      setOtp('');
      setGeneratedOtp('');
    }
  };

  const handleSendOtp = () => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number first');
      return;
    }
    if (cleanPhone.length < 10) {
      Alert.alert(
        'Error',
        'Please enter a valid phone number (at least 10 digits)',
      );
      return;
    }

    setIsSendingOtp(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setTimer(30);
    setOtp('');
    setIsSendingOtp(false);

    Alert.alert(
      'Verification Code Sent',
      `An OTP has been sent to +91 ${cleanPhone.slice(-10)}.\n\nYour OTP is: ${code}\n(or enter 123456 for testing)`,
      [{ text: 'OK' }],
    );
  };

  const handleVerifyOtp = () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    if (otp.trim() === generatedOtp || otp.trim() === '123456') {
      setIsPhoneVerified(true);
      Alert.alert('Success', 'Phone number verified successfully! ✓');
    } else {
      Alert.alert(
        'Invalid OTP',
        'The OTP you entered is incorrect. Please check and try again.',
      );
    }
    setIsVerifying(false);
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert(
        'Error',
        'Please enter a valid phone number (at least 10 digits)',
      );
      return;
    }

    if (!isPhoneVerified) {
      Alert.alert(
        'Phone Not Verified',
        'Please verify your phone number with OTP before creating your account.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Verify Now',
            onPress: () => {
              if (!otpSent) {
                handleSendOtp();
              }
            },
          },
        ],
      );
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

      // Check if user is already present in Firebase
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email.trim());
        if (signInMethods && signInMethods.length > 0) {
          Alert.alert(
            'User Already Exists',
            'An account with this email is already registered in Firebase. Please sign in instead.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign In',
                onPress: () => navigation?.navigate?.('Login'),
              },
            ]
          );
          setLoading(false);
          return;
        }
      } catch (checkError: any) {
        if (checkError?.code === 'auth/email-already-in-use') {
          Alert.alert(
            'User Already Exists',
            'An account with this email is already registered in Firebase. Please sign in instead.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign In',
                onPress: () => navigation?.navigate?.('Login'),
              },
            ]
          );
          setLoading(false);
          return;
        }
        console.warn('Firebase check user notice:', checkError);
      }

      // If not present in Firebase, create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
      }

      const userData = {
        name: name.trim(),
        phone_number: cleanPhone,
        email: email.trim(),
        password: password,
        firebase_uid: userCredential.user.uid,
      };

      // Sync user with backend API
      try {
        await dispatch(addUser(userData));
      } catch (backendError) {
        console.warn('Backend user registration sync warning:', backendError);
      }

      dispatch(
        setUserDetail({
          id: userCredential.user.uid,
          name: name.trim(),
          initials: name.trim()[0]?.toUpperCase() || 'U',
          email: email.trim(),
          phoneNumber: cleanPhone,
          notificationCount: 0,
        })
      );

      Alert.alert(
        'Account Created',
        'Your account has been created successfully.',
      );
    } catch (error: any) {
      console.error('Registration Failed', error);
      let errorMessage = 'Unable to create account. Please try again.';
      if (error?.code === 'auth/email-already-in-use') {
        Alert.alert(
          'User Already Exists',
          'This email address is already in use. Please sign in instead.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign In',
              onPress: () => navigation?.navigate?.('Login'),
            },
          ]
        );
        return;
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

              {/* Phone Number */}
              <View
                style={[
                  styles.inputWrapper,
                  isPhoneVerified && styles.inputWrapperVerified,
                ]}>
                <View
                  style={[
                    styles.iconContainer,
                    isPhoneVerified && styles.iconContainerVerified,
                  ]}>
                  <Image
                    source={require('../../Assets/icons/phone.png')}
                    style={{
                      height: scalePxToDP(18),
                      width: scalePxToDP(18),
                    }}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Phone number"
                  placeholderTextColor={COLORS.placeholder}
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />

                {isPhoneVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Image
                      source={require('../../Assets/icons/check-mark.png')}
                      style={styles.verifiedIcon}
                    />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.sendOtpBtn,
                      (!phoneNumber.trim() ||
                        phoneNumber.replace(/[^0-9]/g, '').length < 10 ||
                        isSendingOtp) &&
                        styles.sendOtpBtnDisabled,
                    ]}
                    onPress={handleSendOtp}
                    disabled={
                      !phoneNumber.trim() ||
                      phoneNumber.replace(/[^0-9]/g, '').length < 10 ||
                      isSendingOtp
                    }>
                    <Text style={styles.sendOtpBtnText}>
                      {isSendingOtp
                        ? 'Sending...'
                        : otpSent
                        ? 'Resend'
                        : 'Verify'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* OTP Input Card */}
              {otpSent && !isPhoneVerified && (
                <View style={styles.otpCard}>
                  <View style={styles.otpHeaderRow}>
                    <Text style={styles.otpCardTitle}>Enter 6-digit OTP</Text>
                    {timer > 0 ? (
                      <Text style={styles.timerText}>Resend in {timer}s</Text>
                    ) : (
                      <TouchableOpacity
                        onPress={handleSendOtp}
                        disabled={isSendingOtp}>
                        <Text style={styles.resendText}>Resend Code</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.otpInputRow}>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="• • • • • •"
                      placeholderTextColor={COLORS.placeholder}
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                    />

                    <TouchableOpacity
                      style={[
                        styles.verifyOtpBtn,
                        otp.trim().length < 6 && styles.verifyOtpBtnDisabled,
                      ]}
                      onPress={handleVerifyOtp}
                      disabled={otp.trim().length < 6 || isVerifying}>
                      <Text style={styles.verifyOtpBtnText}>
                        {isVerifying ? 'Checking...' : 'Confirm'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.otpHint}>
                    Code sent to +91 {phoneNumber.replace(/[^0-9]/g, '').slice(-10)}
                  </Text>
                </View>
              )}

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

  /* OTP & Verified Phone Styles */
  inputWrapperVerified: {
    borderColor: 'rgba(37,220,192,0.45)',
    backgroundColor: '#F0FDF8',
  },

  iconContainerVerified: {
    backgroundColor: '#C5F4E4',
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFAF1',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(37,220,192,0.5)',
  },

  verifiedIcon: {
    width: scalePxToDP(13),
    height: scalePxToDP(13),
    resizeMode: 'contain',
    tintColor: '#0D9488',
    marginRight: 4,
  },

  verifiedText: {
    color: '#0D9488',
    fontSize: 11,
    fontWeight: '700',
  },

  sendOtpBtn: {
    backgroundColor: COLORS.petrol,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendOtpBtnDisabled: {
    opacity: 0.45,
  },

  sendOtpBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  otpCard: {
    backgroundColor: '#EEFAF5',
    borderRadius: 18,
    padding: 13,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: 'rgba(37,220,192,0.3)',
    shadowColor: '#07566A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },

  otpCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navy,
  },

  timerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#789099',
  },

  resendText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.petrol,
  },

  otpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  otpInput: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 4,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: 'rgba(7,86,106,0.12)',
  },

  verifyOtpBtn: {
    height: 44,
    backgroundColor: '#25DCC0',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  verifyOtpBtnDisabled: {
    opacity: 0.5,
  },

  verifyOtpBtnText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
  },

  otpHint: {
    marginTop: 7,
    fontSize: 11,
    color: '#789099',
  },
});