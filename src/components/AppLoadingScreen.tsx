import { useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { AppSpinner, type AppSpinnerTone } from './AppSpinner';
import { AppText } from './AppText';
import { A11Y_ROLES } from '@/a11y';
import { useTheme } from '@/theme';

export interface AppLoadingScreenProps {
  /**
   * Optional message shown below the spinner and spoken to assistive tech.
   * Defaults to `Loading` for the announcement when omitted.
   */
  message?: string;
  /** Spinner colour role. Defaults to `primary`. */
  tone?: AppSpinnerTone;
  style?: StyleProp<ViewStyle>;
  /** Optional test/automation id applied to the root. */
  testID?: string;
}

/**
 * Full-screen, centred loading state: a themed background, a large spinner, and
 * an optional message. The whole screen is a single `progressbar` element for
 * assistive tech — the spinner and visible message are hidden from the
 * accessibility tree so the loading state is announced exactly once. Every
 * colour and spacing value comes from `useTheme()` tokens.
 */
export function AppLoadingScreen({
  message,
  tone = 'primary',
  style,
  testID,
}: AppLoadingScreenProps) {
  const { theme } = useTheme();

  const rootStyle = useMemo<ViewStyle>(
    () => ({
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[4],
      backgroundColor: theme.colors.background,
    }),
    [theme],
  );

  return (
    <View
      style={[rootStyle, style]}
      testID={testID}
      accessible
      accessibilityRole={A11Y_ROLES.progressbar}
      accessibilityLabel={message ?? 'Loading'}
    >
      <AppSpinner size="lg" tone={tone} accessibilityLabel={null} />
      {message ? (
        <AppText
          variant="body"
          tone="secondary"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {message}
        </AppText>
      ) : null}
    </View>
  );
}
