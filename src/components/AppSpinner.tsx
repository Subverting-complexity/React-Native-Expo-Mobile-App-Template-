import {
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { A11Y_ROLES } from '@/a11y';
import { useTheme } from '@/theme';
import type { ColorPalette } from '@/theme';

/**
 * Spinner size. React Native's `ActivityIndicator` renders reliably at two
 * sizes across iOS, Android, and web, so the public API exposes those two as
 * semantic tokens rather than leaking platform-specific numeric sizing.
 */
export type AppSpinnerSize = 'sm' | 'lg';

/** Semantic colour role for the spinner, resolved against the palette. */
export type AppSpinnerTone = 'primary' | 'secondary' | 'inverse' | 'muted';

const SIZE_MAP: Record<AppSpinnerSize, 'small' | 'large'> = {
  sm: 'small',
  lg: 'large',
};

const TONE_COLORS: Record<AppSpinnerTone, keyof ColorPalette> = {
  primary: 'primary',
  secondary: 'secondary',
  inverse: 'textInverse',
  muted: 'textSecondary',
};

export interface AppSpinnerProps {
  /** Semantic size. Defaults to `lg`. */
  size?: AppSpinnerSize;
  /** Semantic colour role. Defaults to `primary`. */
  tone?: AppSpinnerTone;
  /**
   * Spoken description of what is loading. Defaults to `Loading`. Pass
   * `null` to hide the spinner from assistive tech when an ancestor already
   * announces the loading state.
   */
  accessibilityLabel?: string | null;
  style?: StyleProp<ViewStyle>;
  /** Optional test/automation id. */
  testID?: string;
}

/**
 * Indeterminate activity indicator. Colour comes from `useTheme()` tokens via
 * a semantic `tone`, never a hardcoded value. Carries the `progressbar` role so
 * a standalone spinner is announced, and its label is overridable (or removable
 * with `null`) when a parent such as {@link AppLoadingScreen} owns the
 * announcement.
 */
export function AppSpinner({
  size = 'lg',
  tone = 'primary',
  accessibilityLabel = 'Loading',
  style,
  testID,
}: AppSpinnerProps) {
  const { theme } = useTheme();
  const hidden = accessibilityLabel === null;

  return (
    <ActivityIndicator
      size={SIZE_MAP[size]}
      color={theme.colors[TONE_COLORS[tone]]}
      accessible={!hidden}
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? 'no-hide-descendants' : 'yes'}
      accessibilityRole={hidden ? undefined : A11Y_ROLES.progressbar}
      accessibilityLabel={hidden ? undefined : accessibilityLabel}
      style={style}
      testID={testID}
    />
  );
}
