import { useMemo } from 'react';
import { View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { useTheme, FONT_FAMILIES } from '@/theme';
import type { ColorPalette, ThemeTokens } from '@/theme';

export type AppBadgeTone =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type AppBadgeVariant = 'solid' | 'soft' | 'outline';
export type AppBadgeSize = 'sm' | 'md';

interface ToneColors {
  /** The tone's main colour token. */
  base: keyof ColorPalette;
  /** Readable foreground token for the solid fill. */
  on: keyof ColorPalette;
}

const TONES: Record<AppBadgeTone, ToneColors> = {
  neutral: { base: 'textSecondary', on: 'textInverse' },
  primary: { base: 'primary', on: 'onPrimary' },
  secondary: { base: 'secondary', on: 'onSecondary' },
  success: { base: 'success', on: 'onSuccess' },
  warning: { base: 'warning', on: 'onWarning' },
  error: { base: 'error', on: 'onError' },
  info: { base: 'info', on: 'onInfo' },
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
      return { background: baseColor, foreground: theme.colors[on], border: undefined };
    case 'soft':
      return {
        background: theme.colors.surfaceVariant,
        foreground: baseColor,
        border: undefined,
      };
    case 'outline':
      return { background: 'transparent', foreground: baseColor, border: baseColor };
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
  const textSize = theme.typography.sizes[spec.text];

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[spec.paddingH],
      paddingVertical: theme.spacing[spec.paddingV],
      borderRadius: theme.radii.full,
      backgroundColor: colors.background,
      borderWidth: colors.border ? 1 : 0,
      borderColor: colors.border,
    }),
    [theme, spec, colors],
  );

  const labelStyle = useMemo<TextStyle>(
    () => ({
      fontFamily: FONT_FAMILIES.sansBold,
      fontWeight: '700',
      fontSize: textSize.fontSize,
      lineHeight: textSize.lineHeight,
      color: colors.foreground,
    }),
    [textSize, colors.foreground],
  );

  return (
    <View
      style={[containerStyle, style]}
      testID={testID}
      accessible={accessibilityLabel != null ? true : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <AppText variant="caption" style={labelStyle} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}
