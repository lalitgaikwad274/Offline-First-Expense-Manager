import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export interface AlertAction {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface AlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  actions?: AlertAction[];
  onDismiss?: () => void;
  /** Set to true when already inside an active Modal to avoid nested Modal issues on Android */
  asOverlay?: boolean;
}

export interface AlertConfig {
  title?: string;
  message?: string;
  actions?: AlertAction[];
  onDismiss?: () => void;
}

type AlertListener = (config: AlertConfig | null) => void;

let activeListener: AlertListener | null = null;

export const setAlertListener = (listener: AlertListener | null) => {
  activeListener = listener;
};

/**
 * Programmatically display an authentic iOS-styled Alert from anywhere in the app
 */
export const showAlert = (
  title?: string,
  message?: string,
  actions?: AlertAction[],
  options?: { cancelable?: boolean; onDismiss?: () => void }
) => {
  const finalActions: AlertAction[] =
    actions && actions.length > 0
      ? actions
      : [{ text: 'OK', style: 'default' }];

  if (activeListener) {
    activeListener({
      title,
      message,
      actions: finalActions,
      onDismiss: options?.onDismiss,
    });
  } else {
    // Fallback if host is not mounted
    const buttons = finalActions.map(a => ({
      text: a.text,
      onPress: a.onPress,
      style: a.style,
    }));
    Alert.alert(title || '', message || '', buttons, options);
  }
};

/**
 * Dismiss the currently active iOS Alert
 */
export const hideAlert = () => {
  if (activeListener) {
    activeListener(null);
  }
};

/**
 * Transparently intercept React Native's standard Alert.alert calls
 * so existing and future Alert.alert calls across the whole project
 * automatically render as the iOS-styled alert.
 */
export const enableGlobalAlert = () => {
  Alert.alert = (
    title?: string,
    message?: string,
    buttons?: any[],
    options?: any
  ) => {
    showAlert(title, message, buttons, options);
  };
};

/**
 * Presentational iOS Alert Component
 */
export const AlertBox: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  actions = [{ text: 'OK', style: 'default' }],
  onDismiss,
  asOverlay = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1.15)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 24,
          stiffness: 320,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1.15);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) {
    return null;
  }

  const effectiveActions = actions.length > 0 ? actions : [{ text: 'OK', style: 'default' as const }];
  // In iOS UIAlertController, 2 actions are placed side-by-side only if both fit comfortably.
  // If either button has a longer title (> 11 characters), it automatically displays as a vertical stack.
  const hasLongAction = effectiveActions.some(action => (action.text || '').trim().length > 11);
  const isTwoActions = effectiveActions.length === 2 && !hasLongAction;

  const content = (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      <Animated.View
        style={[
          styles.alertContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Header Content */}
        <View style={styles.contentSection}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>

        {/* Hairline Divider */}
        <View style={styles.horizontalDivider} />

        {/* Action Buttons */}
        {isTwoActions ? (
          <View style={styles.horizontalActionsRow}>
            {effectiveActions.map((action, index) => {
              const isDestructive = action.style === 'destructive';
              const isCancel = action.style === 'cancel';

              return (
                <React.Fragment key={index}>
                  {index > 0 && <View style={styles.verticalDivider} />}
                  <Pressable
                    style={({ pressed }) => [
                      styles.horizontalActionButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => {
                      onDismiss?.();
                      action.onPress?.();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={action.text}
                  >
                    <Text
                      style={[
                        styles.actionText,
                        isCancel && styles.cancelText,
                        isDestructive && styles.destructiveText,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.78}
                    >
                      {action.text}
                    </Text>
                  </Pressable>
                </React.Fragment>
              );
            })}
          </View>
        ) : (
          <View style={styles.verticalActionsContainer}>
            {effectiveActions.map((action, index) => {
              const isDestructive = action.style === 'destructive';
              const isCancel = action.style === 'cancel';

              return (
                <React.Fragment key={index}>
                  {index > 0 && <View style={styles.horizontalDivider} />}
                  <Pressable
                    style={({ pressed }) => [
                      styles.verticalActionButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => {
                      onDismiss?.();
                      action.onPress?.();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={action.text}
                  >
                    <Text
                      style={[
                        styles.actionText,
                        isCancel && styles.cancelText,
                        isDestructive && styles.destructiveText,
                      ]}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      {action.text}
                    </Text>
                  </Pressable>
                </React.Fragment>
              );
            })}
          </View>
        )}
      </Animated.View>
    </View>
  );

  if (asOverlay) {
    return <View style={styles.overlayWrapper}>{content}</View>;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      {content}
    </Modal>
  );
};

/**
 * Top-level Host Component for mounting in App.tsx
 * Automatically captures global showAlert and Alert.alert calls
 */
export const AlertHost: React.FC = () => {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  useEffect(() => {
    setAlertListener(cfg => {
      setConfig(cfg);
    });
    enableGlobalAlert();

    return () => {
      setAlertListener(null);
    };
  }, []);

  if (!config) {
    return null;
  }

  return (
    <AlertBox
      visible={!!config}
      title={config.title}
      message={config.message}
      actions={config.actions}
      onDismiss={() => {
        config.onDismiss?.();
        setConfig(null);
      }}
    />
  );
};

const styles = StyleSheet.create({
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  alertContainer: {
    width: 280,
    maxWidth: '86%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  contentSection: {
    paddingTop: 20,
    paddingBottom: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  message: {
    fontSize: 13,
    fontWeight: '400',
    color: '#3C3C43',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    letterSpacing: -0.2,
  },
  horizontalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D1D1D6',
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#D1D1D6',
  },
  horizontalActionsRow: {
    flexDirection: 'row',
    height: 44,
  },
  horizontalActionButton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  verticalActionsContainer: {
    flexDirection: 'column',
  },
  verticalActionButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#007AFF',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  cancelText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  destructiveText: {
    fontWeight: '500',
    color: '#FF3B30',
  },
  buttonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.07)',
  },
});

export default AlertHost;
