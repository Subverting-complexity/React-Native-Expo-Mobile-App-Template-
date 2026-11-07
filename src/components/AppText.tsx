import { useMemo } from 'react';
import {
  Text,
  useWindowDimensions,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { MAX_FONT_SIZE_MULTIPLIER, fontScaleFactor } from '@/a11y';
import { INTENT_COLORS, useTheme } from '@/theme';
import type { ColorPalette, TextScale, TextVariantName } from '@/theme';

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

/**
 * Maps each semantic text {@link TextTone} to a single palette colour token.
 * Exported so sibling components (links, back buttons) resolve a tone to the
 * same colour token AppText uses — the mapping lives here once.
 */
export const TONE_COLORS: Record<TextTone, keyof ColorPalette> = {
  primary: 'textPrimary',
  secondary: 'textSecondary',
  disabled: 'textDisabled',
  inverse: 'textInverse',
  accent: INTENT_COLORS.primary.base,
  success: INTENT_COLORS.success.base,
  warning: INTENT_COLORS.warning.base,
  error: INTENT_COLORS.error.base,
  info: INTENT_COLORS.info.base,
};

/**
 * Props for {@link AppText}. Extends React Native `Text` so every standard
 * prop (`numberOfLines`, `onPress`, `selectable`, …) passes through; adds the
 * theme-driven `variant` and `tone` selectors.
 */
export interface AppTextProps extends TextProps {
  /** Semantic typography role. Defaults to `body`. */
  variant?: TextVariantName;
  /**
   * A size from the type scale in place of the variant's own size. The
   * variant still sets the family and weight. Use this, not a `fontSize` or
   * `lineHeight` in `style`, so the line height still scales with the OS font
   * size.
   */
  size?: keyof TextScale;
  /** Semantic colour role. Defaults to `primary`. */
  tone?: TextTone;
}

/**
 * Typography-aware text primitive. Resolves `variant` to size/family/weight
 * from the typography tokens and `tone` to a palette colour — never hardcodes
 * a font size, family, or colour. Caller `style` is merged last so one-off
 * overrides still win.
 *
 * Dynamic Type: React Native scales `fontSize` with the OS font setting (capped
 * by `maxFontSizeMultiplier`) but leaves `lineHeight` fixed, which clips large
 * text. AppText scales `lineHeight` by the same capped factor so type stays
 * legible and proportional up to the cap. The cap defaults to the single-source
 * {@link MAX_FONT_SIZE_MULTIPLIER}; a per-instance `maxFontSizeMultiplier` (a
 * number, or `null` to opt out of the cap) always wins, and
 * `allowFontScaling={false}` freezes scaling entirely.
 */
export function AppText({
  variant = 'body',
  size: sizeOverride,
  tone = 'primary',
  allowFontScaling = true,
  maxFontSizeMultiplier = MAX_FONT_SIZE_MULTIPLIER,
  style,
  ...rest
}: AppTextProps) {
  const { theme } = useTheme();
  const { fontScale } = useWindowDimensions();

  const resolved = useMemo<TextStyle>(() => {
    const v = theme.typography.variants[variant];
    const size = theme.typography.sizes[sizeOverride ?? v.size];
    const lineScale = fontScaleFactor(
      fontScale,
      allowFontScaling,
      maxFontSizeMultiplier,
    );

    return {
      fontSize: size.fontSize,
      lineHeight: size.lineHeight * lineScale,
      letterSpacing: size.letterSpacing,
      fontFamily: v.family,
      fontWeight: v.weight,
      color: theme.colors[TONE_COLORS[tone]],
    };
  }, [
    theme,
    variant,
    sizeOverride,
    tone,
    fontScale,
    allowFontScaling,
    maxFontSizeMultiplier,
  ]);

  return (
    <Text
      style={[resolved, style]}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...rest}
    />
  );
}
