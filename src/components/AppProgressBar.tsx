import { useEffect, useMemo, useState } from 'react';
import { Animated, View, type StyleProp, type ViewStyle } from 'react-native';

import { A11Y_ROLES, useReduceMotion } from '@/a11y';
import { useTheme } from '@/theme';
import type { ColorPalette } from '@/theme';

/** Semantic colour role for the filled portion of the bar. */
export type AppProgressTone =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

const TONE_COLORS: Record<AppProgressTone, keyof ColorPalette> = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
};

/** Duration of the fill transition when motion is not reduced. */
const FILL_DURATION_MS = 240;

export interface AppProgressBarProps {
  /** Completion fraction in the range `0`–`1`. Values outside are clamped. */
  value: number;
  /** Fill colour role. Defaults to `primary`. */
  tone?: AppProgressTone;
  /** Track height in points. Defaults to spacing token `2` (8px). */
  height?: number;
  /**
   * Screen-reader name for the bar, e.g. `Upload progress`. The percentage is
   * appended automatically via `accessibilityValue`.
   */
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  /** Optional test/automation id applied to the track. */
  testID?: string;
}

function clampFraction(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/**
 * Determinate linear progress bar. The track and fill colours, radius, and
 * default height all come from `useTheme()` tokens. The fill animates between
 * values, but honours the OS reduce-motion preference via {@link useReduceMotion}
 * by snapping instantly. Carries the `progressbar` role and an
 * `accessibilityValue` so the percentage complete is spoken.
 */
export function AppProgressBar({
  value,
  tone = 'primary',
  height,
  accessibilityLabel,
  style,
  testID,
}: AppProgressBarProps) {
  const { theme } = useTheme();
  const reduceMotion = useReduceMotion();

  const fraction = clampFraction(value);
  const percent = Math.round(fraction * 100);

  // Hold a single Animated.Value across renders. `useState` with a lazy
  // initialiser (not `useRef().current`) keeps the instance stable while
  // staying clear of the ref-during-render lint rule.
  const [progress] = useState(() => new Animated.Value(fraction));

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(fraction);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: fraction,
      duration: FILL_DURATION_MS,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [fraction, reduceMotion, progress]);

  const trackHeight = height ?? theme.spacing[2];

  const trackStyle = useMemo<ViewStyle>(
    () => ({
      height: trackHeight,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceVariant,
      overflow: 'hidden',
    }),
    [theme, trackHeight],
  );

  const fillColor = theme.colors[TONE_COLORS[tone]];

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[trackStyle, style]}
      testID={testID}
      accessible
      accessibilityRole={A11Y_ROLES.progressbar}
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
    >
      <Animated.View
        testID={testID ? `${testID}-fill` : undefined}
        style={{
          width,
          height: '100%',
          borderRadius: theme.radii.full,
          backgroundColor: fillColor,
        }}
      />
    </View>
  );
}
