import { useEffect, useMemo, useState } from 'react';
import { Animated, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppPressable } from './AppPressable';
import { AppText } from './AppText';
import type { ToastAction, ToastTone } from './ToastContext';
import { A11Y_ROLES, announceForAccessibility, useReduceMotion } from '@/a11y';
import { useTheme } from '@/theme';
import type { ColorPalette, ThemeTokens } from '@/theme';

/** Default auto-dismiss delay in ms. */
export const DEFAULT_TOAST_DURATION_MS = 4000;

/** Duration of the entrance transition when motion is not reduced. */
const ENTER_DURATION_MS = 200;

const TONE_STYLES: Record<
  ToastTone,
  { background: keyof ColorPalette; foreground: keyof ColorPalette }
> = {
  info: { background: 'info', foreground: 'onInfo' },
  success: { background: 'success', foreground: 'onSuccess' },
  warning: { background: 'warning', foreground: 'onWarning' },
  error: { background: 'error', foreground: 'onError' },
};

export interface AppToastProps {
  /** Message to display and announce. */
  message: string;
  /** Intent / colour. Defaults to `info`. */
  tone?: ToastTone;
  /**
   * Auto-dismiss delay in ms. Defaults to {@link DEFAULT_TOAST_DURATION_MS}.
   * Pass `0` to disable auto-dismiss.
   */
  duration?: number;
  /** Called when the close button is pressed or the auto-dismiss fires. */
  onDismiss: () => void;
  /** Optional action button rendered before the close affordance. */
  action?: ToastAction;
  style?: StyleProp<ViewStyle>;
  /** Optional test/automation id applied to the surface. */
  testID?: string;
}

function buildSurfaceStyle(theme: ThemeTokens, background: string): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.radii.md,
    backgroundColor: background,
    ...theme.shadows.md,
  };
}

/**
 * Presentational toast surface. Renders with the `alert` role and announces its
 * message through {@link announceForAccessibility} on appear, so a screen-reader
 * user hears it without moving focus. Colours come from `useTheme()` tokens via
 * the semantic `tone`. The toast animates in (honouring the OS reduce-motion
 * preference) and auto-dismisses after `duration`; a close button and optional
 * action let the user dismiss or act sooner.
 *
 * State and queueing live in {@link ToastProvider} — render this directly only
 * when you need a one-off, self-managed toast.
 */
export function AppToast({
  message,
  tone = 'info',
  duration = DEFAULT_TOAST_DURATION_MS,
  onDismiss,
  action,
  style,
  testID,
}: AppToastProps) {
  const { theme } = useTheme();
  const reduceMotion = useReduceMotion();

  const toneStyle = TONE_STYLES[tone];
  const background = theme.colors[toneStyle.background];
  const foreground = theme.colors[toneStyle.foreground];

  // Announce on appear and whenever the message changes (the provider keys this
  // component per `show`, so a repeated message still re-mounts and re-speaks).
  useEffect(() => {
    announceForAccessibility(message);
  }, [message]);

  // Auto-dismiss. `0` opts out; any change to the timing inputs resets it.
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  // Stable Animated.Value across renders via a lazy `useState` initialiser
  // (avoids the ref-during-render lint rule that `useRef().current` trips).
  const [enter] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));

  useEffect(() => {
    if (reduceMotion) {
      enter.setValue(1);
      return;
    }
    const animation = Animated.timing(enter, {
      toValue: 1,
      duration: ENTER_DURATION_MS,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [reduceMotion, enter]);

  const surfaceStyle = useMemo(
    () => buildSurfaceStyle(theme, background),
    [theme, background],
  );

  const translateY = enter.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.spacing[2], 0],
  });

  return (
    <Animated.View style={{ opacity: enter, transform: [{ translateY }] }}>
      <View
        style={[surfaceStyle, style]}
        testID={testID}
        accessible
        accessibilityRole={A11Y_ROLES.alert}
        accessibilityLiveRegion="polite"
      >
        <AppText
          variant="body"
          style={{ flex: 1, color: foreground }}
          accessibilityLabel={message}
        >
          {message}
        </AppText>

        {action ? (
          <AppPressable
            accessibilityRole={A11Y_ROLES.button}
            accessibilityLabel={action.label}
            onPress={action.onPress}
            style={{ paddingHorizontal: theme.spacing[2] }}
            testID={testID ? `${testID}-action` : undefined}
          >
            <AppText variant="label" style={{ color: foreground }}>
              {action.label}
            </AppText>
          </AppPressable>
        ) : null}

        <AppPressable
          accessibilityRole={A11Y_ROLES.button}
          accessibilityLabel="Dismiss"
          onPress={onDismiss}
          testID={testID ? `${testID}-dismiss` : undefined}
        >
          <AppText variant="label" style={{ color: foreground }}>
            ✕
          </AppText>
        </AppPressable>
      </View>
    </Animated.View>
  );
}
