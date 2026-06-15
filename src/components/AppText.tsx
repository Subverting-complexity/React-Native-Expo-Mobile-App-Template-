import { useMemo } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme';
import type { ColorPalette, TextVariantName } from '@/theme';

/**
 * Semantic colour roles for text. Each maps to a single colour token, so a
 * caller picks a *meaning* (`secondary`, `error`) and re-skinning happens in
 * the palette, never here.
 */
export type TextTone =
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'inverse'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

const TONE_COLORS: Record<TextTone, keyof ColorPalette> = {
  primary: 'textPrimary',
  secondary: 'textSecondary',
  disabled: 'textDisabled',
  inverse: 'textInverse',
  accent: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
};

/**
 * Props for {@link AppText}. Extends React Native `Text` so every standard
 * prop (`numberOfLines`, `onPress`, `selectable`, …) passes through; adds the
 * theme-driven `variant` and `tone` selectors.
 */
export interface AppTextProps extends TextProps {
  /** Semantic typography role. Defaults to `body`. */
  variant?: TextVariantName;
  /** Semantic colour role. Defaults to `primary`. */
  tone?: TextTone;
}

/**
 * Typography-aware text primitive. Resolves `variant` to size/family/weight
 * from the typography tokens and `tone` to a palette colour — never hardcodes
 * a font size, family, or colour. Caller `style` is merged last so one-off
 * overrides still win.
 */
export function AppText({
  variant = 'body',
  tone = 'primary',
  style,
  ...rest
}: AppTextProps) {
  const { theme } = useTheme();

  const resolved = useMemo<TextStyle>(() => {
    const v = theme.typography.variants[variant];
    const size = theme.typography.sizes[v.size];
    return {
      fontSize: size.fontSize,
      lineHeight: size.lineHeight,
      letterSpacing: size.letterSpacing,
      fontFamily: v.family,
      fontWeight: v.weight,
      color: theme.colors[TONE_COLORS[tone]],
    };
  }, [theme, variant, tone]);

  return <Text style={[resolved, style]} {...rest} />;
}
