import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppPressable, type AppPressableProps } from './AppPressable';
import { AppText, TONE_COLORS, type TextTone } from './AppText';
import type { AppIcon } from './AppIconButton';
import { A11Y_ROLES } from '@/a11y';
import { useTheme } from '@/theme';
import type { TextVariantName, ThemeTokens } from '@/theme';

export type AppBackButtonSize = 'sm' | 'md' | 'lg';

/** Glyph size key (typography scale) per size — keeps the arrow token-sourced. */
const GLYPH_SIZE: Record<
  AppBackButtonSize,
  keyof ThemeTokens['typography']['sizes']
> = {
  sm: 'lg',
  md: '2xl',
  lg: '3xl',
};

/** Visible label typography variant per size. */
const LABEL_VARIANT: Record<AppBackButtonSize, TextVariantName> = {
  sm: 'bodySmall',
  md: 'body',
  lg: 'subheading',
};

/** Left-pointing arrow used as the default back glyph. */
const BACK_GLYPH = '←';

/** Resolves the glyph: the default arrow, a render function, or a given node. */
function resolveBackIcon(
  icon: AppIcon | undefined,
  color: string,
  size: number,
): ReactNode {
  if (icon == null) {
    return (
      <AppText style={{ fontSize: size, lineHeight: size, color }}>
        {BACK_GLYPH}
      </AppText>
    );
  }
  return typeof icon === 'function' ? icon({ color, size }) : icon;
}

/**
 * Props for {@link AppBackButton}.
 *
 * Defaults to an arrow-only control announced as "Go back". An optional visible
 * `label` (e.g. the previous screen's name) renders beside the glyph, and a
 * custom `icon` replaces the default arrow — keeping the component free of any
 * icon dependency.
 */
export interface AppBackButtonProps extends Omit<
  AppPressableProps,
  'accessibilityRole' | 'accessibilityLabel' | 'children' | 'style'
> {
  /** Optional visible text rendered after the glyph. */
  label?: string;
  /** Replaces the default arrow. A node, or a builder given `{ color, size }`. */
  icon?: AppIcon;
  /** Semantic colour role. Defaults to `accent` (the primary brand colour). */
  tone?: TextTone;
  size?: AppBackButtonSize;
  /** Spoken name. Defaults to "Go back". */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Theme-driven back-navigation control. Builds on {@link AppPressable} for the
 * 44×44 touch floor and required accessibility wiring. The glyph and label
 * colour resolve from the shared tone → token map, never a hardcoded value.
 */
export function AppBackButton({
  label,
  icon,
  tone = 'accent',
  size = 'md',
  disabled = false,
  accessibilityLabel = 'Go back',
  style,
  ...rest
}: AppBackButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled ?? false;
  const glyphSize = theme.typography.sizes[GLYPH_SIZE[size]].fontSize;
  const color = theme.colors[TONE_COLORS[isDisabled ? 'disabled' : tone]];

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[1],
      alignSelf: 'flex-start',
      opacity: isDisabled ? 0.5 : 1,
    }),
    [theme, isDisabled],
  );

  const renderedIcon = resolveBackIcon(icon, color, glyphSize);

  return (
    <AppPressable
      accessibilityRole={A11Y_ROLES.button}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={(state) => [
        containerStyle,
        state.pressed && !isDisabled ? styles.pressed : null,
      ]}
      {...rest}
    >
      <View>{renderedIcon}</View>
      {label ? (
        <AppText
          variant={LABEL_VARIANT[size]}
          tone={isDisabled ? 'disabled' : tone}
        >
          {label}
        </AppText>
      ) : null}
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
});
