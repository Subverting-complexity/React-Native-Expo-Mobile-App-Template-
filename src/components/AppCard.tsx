import { useMemo, type ReactNode } from 'react';
import {
  View,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppPressable } from './AppPressable';
import { useTheme } from '@/theme';
import type { ThemeTokens } from '@/theme';

export type AppCardVariant = 'elevated' | 'outlined' | 'filled';

/** Spacing-token key controlling inner padding. */
export type AppCardPadding = keyof ThemeTokens['spacing'];

interface BaseProps {
  variant?: AppCardVariant;
  /** Inner padding as a spacing-token key. Defaults to `4` (16px). */
  padding?: AppCardPadding;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** Optional test/automation id applied to the card surface. */
  testID?: string;
}

interface StaticCardProps extends BaseProps {
  onPress?: undefined;
}

interface PressableCardProps extends BaseProps {
  /** When provided the whole card becomes a single tappable surface. */
  onPress: () => void;
  /** Required once the card is interactive — names it for screen readers. */
  accessibilityLabel: string;
  accessibilityHint?: string;
  /** Defaults to `button`. */
  accessibilityRole?: AccessibilityRole;
}

export type AppCardProps = StaticCardProps | PressableCardProps;

/**
 * Surface container. `elevated` adds a themed shadow, `outlined` a border, and
 * `filled` a tinted background — all from `useTheme()` tokens. Passing
 * `onPress` upgrades the card to an {@link AppPressable}, which forces an
 * accessibility label and the 44×44 touch floor.
 */
export function AppCard(props: AppCardProps) {
  const { variant = 'elevated', padding = 4, style, children, testID } = props;
  const { theme } = useTheme();

  const containerStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {
      backgroundColor:
        variant === 'filled'
          ? theme.colors.surfaceVariant
          : theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing[padding],
    };
    if (variant === 'outlined') {
      base.borderWidth = 1;
      base.borderColor = theme.colors.border;
    }
    if (variant === 'elevated') {
      Object.assign(base, theme.shadows.md);
    }
    return base;
  }, [theme, variant, padding]);

  if (props.onPress) {
    return (
      <AppPressable
        accessibilityRole={props.accessibilityRole ?? 'button'}
        accessibilityLabel={props.accessibilityLabel}
        accessibilityHint={props.accessibilityHint}
        onPress={props.onPress}
        testID={testID}
        // Reset AppPressable's centering floor so card content lays out top-down.
        style={[
          { alignItems: 'stretch', justifyContent: 'flex-start' },
          containerStyle,
          style,
        ]}
      >
        {children}
      </AppPressable>
    );
  }

  return (
    <View style={[containerStyle, style]} testID={testID}>
      {children}
    </View>
  );
}
