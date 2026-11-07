import { useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { INTENT_COLORS, useTheme } from '@/theme';
import type { ColorIntent, IntentColors, ThemeTokens } from '@/theme';

export type AppBadgeTone = 'neutral' | ColorIntent;

export type AppBadgeVariant = 'solid' | 'soft' | 'outline';
export type AppBadgeSize = 'sm' | 'md';

const TONES: Record<AppBadgeTone, IntentColors> = {
  neutral: { base: 'textSecondary', on: 'textInverse' },
  ...INTENT_COLORS,
};

const SIZE_SPEC: Record<
  AppBadgeSize,
  {
    paddingH: keyof ThemeTokens['spacing'];
    paddingV: keyof ThemeTokens['spacing'];
    text: keyof ThemeTokens['typography']['sizes'];
  }
> = {
  sm: { paddingH: 2, paddingV: 0.5, text: 'xs' },
  md: { paddingH: 3, paddingV: 1, text: 'sm' },
};

/**
 * Props for {@link AppBadge}.
 *
 * A small, non-interactive pill for status or meta labels. The visible `label`
 * is read by screen readers as-is; pass `accessibilityLabel` to give it context
 * (e.g. "Status: Active") without changing the visible text.
 */
export interface AppBadgeProps {
  /** Visible badge text. */
  label: string;
  tone?: AppBadgeTone;
  variant?: AppBadgeVariant;
  size?: AppBadgeSize;
  /** Optional spoken name; when set the badge is announced as a single node. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

interface ResolvedBadge {
  background: string;
  foreground: string;
  border: string | undefined;
}

function resolveBadge(
  theme: ThemeTokens,
  tone: AppBadgeTone,
  variant: AppBadgeVariant,
): ResolvedBadge {
  const { base, on } = TONES[tone];
  const baseColor = theme.colors[base];
  switch (variant) {
    case 'solid':
      return {
        background: baseColor,
        foreground: theme.colors[on],
        border: undefined,
      };
    case 'soft':
      return {
        background: theme.colors.surfaceVariant,
        foreground: baseColor,
        border: undefined,
      };
    case 'outline':
      return {
        background: 'transparent',
        foreground: baseColor,
        border: baseColor,
      };
  }
}

/**
 * Theme-driven status/meta badge. Every colour, padding, radius, and type value
 * comes from `useTheme()` tokens; re-skinning is a token edit. Pure presentation
 * — it renders a `View` + {@link AppText} and never captures touches.
 */
export function AppBadge({
  label,
  tone = 'neutral',
  variant = 'solid',
  size = 'md',
  accessibilityLabel,
  style,
  testID,
}: AppBadgeProps) {
  const { theme } = useTheme();
  const spec = SIZE_SPEC[size];
  const colors = resolveBadge(theme, tone, variant);

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[spec.paddingH],
      paddingVertical: theme.spacing[spec.paddingV],
      borderRadius: theme.radii.full,
      backgroundColor: colors.background,
      borderWidth: colors.border ? theme.borderWidths.thin : 0,
      borderColor: colors.border,
    }),
    [theme, spec, colors],
  );

  return (
    <View
      style={[containerStyle, style]}
      testID={testID}
      accessible={accessibilityLabel != null ? true : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <AppText
        variant="label"
        size={spec.text}
        style={{ color: colors.foreground }}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </View>
  );
}
