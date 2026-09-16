import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SCREEN_NAMES } from '../../utils/screenNames';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { COLORS } from '../../utils/colors';
import { scalePxToDP } from '../../utils/responsive';

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const LoginScreen = () => {
    const navigation = useNavigation<LoginNavigationProp>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        console.log(`Email: ${email}\nPassword: ${password}\nRemember Me: ${rememberMe}`);

        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }
        try {
            setLoading(true);
            const auth = getAuth();
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password,
            );

            console.log('Login successful:', userCredential.user);
            Alert.alert('Success', 'Logged in successfully!');
        } catch (error: any) {
            console.error('Login Failed', error);
            let errorMessage = 'Unable to login. Please try again.';
            if (
                error?.code === 'auth/invalid-credential' ||
                error?.code === 'auth/wrong-password' ||
                error?.code === 'auth/user-not-found'
            ) {
                errorMessage = 'Invalid email or password.';
            } else if (error?.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            } else if (error?.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error?.code === 'auth/user-disabled') {
                errorMessage = 'This account has been disabled.';
            } else if (error?.code === 'auth/too-many-requests') {
                errorMessage = 'Too many attempts. Please try again later.';
            } else if (
                error?.code === 'auth/configuration-not-found' ||
                error?.message?.includes('CONFIGURATION_NOT_FOUND')
            ) {
                errorMessage =
                    'Email/Password sign-in is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.';
            } else if (error?.message) {
                errorMessage = error.message;
            }
            Alert.alert('Login Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#07566A', '#123C72', '#171B61', '#E9FFF6']}
            locations={[0, 0.35, 0.55, 1]}
            style={styles.container}
        >
            {/* Background Clay Shapes */}
            <View style={styles.topMintCircle} />
            <View style={styles.topBlueCircle} />
            <View style={styles.bottomMintCircle} />
            <View style={styles.bottomBlueCircle} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    Welcome <Text style={styles.titleRed}>Back</Text>
                </Text>
                <Text style={styles.subtitle}>
                    Sign in to continue your journey
                </Text>
            </View>

            {/* Clay Login Card */}
            <View style={styles.loginCard}>
                {/* Email */}
                <View style={styles.inputWrapper}>
                    <Image
                        source={require('../../Assets/icons/user.png')}
                        style={{
                            height: scalePxToDP(18),
                            width: scalePxToDP(18),
                        }}
                    />
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your@email.com"
                        placeholderTextColor="#91A8B7"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                    />
                </View>

                {/* Password */}
                <View style={styles.inputWrapper}>
                    <Image
                        source={require('../../Assets/icons/padlock.png')}
                        style={{
                            height: scalePxToDP(18),
                            width: scalePxToDP(18),
                        }}
                    />
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor="#91A8B7"
                        secureTextEntry={!showPassword}
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Image
                            source={showPassword ? require('../../Assets/icons/see.png') : require('../../Assets/icons/not-visible.png')}
                            style={{
                                height: scalePxToDP(18),
                                width: scalePxToDP(18),
                            }}
                        />
                    </TouchableOpacity>
                </View>

                {/* Remember / Forgot */}
                <View style={styles.rememberRow}>
                    <TouchableOpacity
                        style={styles.rememberContainer}
                        onPress={() => setRememberMe(!rememberMe)}
                    >
                        <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                            {rememberMe && (
                                <Image
                                    source={require('../../Assets/icons/check-mark.png')}
                                    style={{
                                        height: scalePxToDP(16),
                                        width: scalePxToDP(16),
                                        resizeMode: 'contain',
                                        tintColor: '#FFF',
                                    }}
                                />
                            )}
                        </View>
                        <Text style={styles.rememberText}>Remember me</Text>
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                {/* Sign In */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleLogin}
                    disabled={loading}
                    style={[styles.signInShadow, loading && { opacity: 0.7 }]}
                >
                    <LinearGradient
                        colors={['#FF5368', '#FF2448']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.signInButton}
                    >
                        <Text style={styles.signInText}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.orText}>Or continue with</Text>
                    <View style={styles.divider} />
                </View>

                {/* Social Login */}
                <View style={styles.socialRow}>
                    <TouchableOpacity style={styles.socialButton}>
                        <Image
                            source={require('../../Assets/icons/google.webp')}
                            style={styles.Icon}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialButton}>
                        <Image
                            source={require('../../Assets/icons/apple.webp')}
                            style={{
                                height: scalePxToDP(30),
                                width: scalePxToDP(30),
                            }}
                        />
                    </TouchableOpacity>
                </View>

                {/* Register */}
                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Don't have an account?</Text>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate(SCREEN_NAMES.REGISTER);
                        }}
                    >
                        <Text style={styles.registerLink}> Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 100,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    /* Background Clay Elements */
    topMintCircle: {
        position: 'absolute',
        width: 190,
        height: 190,
        borderRadius: 100,
        top: -100,
        left: -70,
        backgroundColor: '#0798B8',
        opacity: 0.9,
    },
    topBlueCircle: {
        position: 'absolute',
        width: 230,
        height: 230,
        borderRadius: 120,
        top: -110,
        right: -90,
        backgroundColor: '#193C86',
        opacity: 0.9,
    },
    bottomMintCircle: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 140,
        bottom: -150,
        left: -120,
        backgroundColor: '#25DCC0',
        opacity: 0.9,
        zIndex: 1,
    },
    bottomBlueCircle: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 140,
        bottom: -150,
        right: -120,
        backgroundColor: '#35CDEB',
        opacity: 0.8,
        zIndex: 1,
    },
    /* Header */
    header: {
        marginTop: 55,
        marginBottom: 25,
        paddingHorizontal: 15,
    },
    title: {
        fontSize: 31,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: -0.5,
    },
    titleRed: {
        color: COLORS.red,
    },
    subtitle: {
        marginTop: 5,
        fontSize: 15,
        color: '#D8E8F2',
        fontWeight: '500',
    },
    /* Clay Login Card */
    loginCard: {
        flex: 1,
        backgroundColor: 'rgba(246, 255, 253, 0.96)',
        borderRadius: 34,
        paddingHorizontal: 18,
        paddingVertical: 22,
        shadowColor: '#001B35',
        shadowOffset: {
            width: 0,
            height: 14,
        },
        shadowOpacity: 0.28,
        shadowRadius: 22,
        elevation: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    /* Clay Input */
    inputWrapper: {
        height: 58,
        borderRadius: 29,
        backgroundColor: COLORS.input,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 17,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E1EEF3',
        shadowColor: '#7A9BAA',
        shadowOffset: {
            width: 3,
            height: 5,
        },
        shadowOpacity: 0.18,
        shadowRadius: 7,
        elevation: 5,
    },
    input: {
        flex: 1,
        height: '100%',
        marginLeft: 12,
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },
    /* Remember */
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
        marginBottom: 19,
        paddingHorizontal: 5,
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 23,
        height: 23,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: COLORS.petrol,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    checkboxActive: {
        backgroundColor: COLORS.petrol,
        borderColor: COLORS.petrol,
    },
    rememberText: {
        fontSize: 12,
        color: COLORS.petrolDark,
        fontWeight: '600',
    },
    forgotText: {
        fontSize: 12,
        color: COLORS.red,
        fontWeight: '700',
    },
    /* Red Clay Button */
    signInShadow: {
        borderRadius: 30,
        shadowColor: COLORS.redDark,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },
    signInButton: {
        height: 58,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FF7180',
    },
    signInText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '800',
    },
    /* Divider */
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 21,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#C9DDE4',
    },
    orText: {
        marginHorizontal: 12,
        color: '#7695A3',
        fontSize: 12,
        fontWeight: '600',
    },
    /* Social Buttons */
    socialRow: {
        flexDirection: 'row',
        gap: 15,
    },
    socialButton: {
        flex: 1,
        height: 55,
        borderRadius: 27,
        backgroundColor: '#F4FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E0EDF2',
        shadowColor: '#7394A3',
        shadowOffset: {
            width: 3,
            height: 5,
        },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 5,
    },
    Icon: {
        height: scalePxToDP(50),
        width: scalePxToDP(50),
    },
    /* Register */
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 27,
    },
    registerText: {
        color: COLORS.petrolDark,
        fontSize: 12,
        fontWeight: '500',
    },
    registerLink: {
        color: COLORS.red,
        fontSize: 12,
        fontWeight: '800',
    },
});