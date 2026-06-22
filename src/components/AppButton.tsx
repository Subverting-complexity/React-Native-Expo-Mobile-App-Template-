import { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { AppPressable, type AppPressableProps } from './AppPressable';
import { AppText } from './AppText';
import {
  BUTTON_VARIANTS,
  resolveVariantColors,
  type ButtonVariant,
  type ResolvedColors,
} from './buttonUtils';
import { A11Y_ROLES } from '@/a11y';
import { useTheme, FONT_FAMILIES } from '@/theme';
import type { ThemeTokens } from '@/theme';

export type AppButtonVariant = ButtonVariant;

export type AppButtonSize = 'sm' | 'md' | 'lg';

/** Spacing-token keys per size, resolved against the theme at render. */
const SIZE_SPEC: Record<
  AppButtonSize,
  {
    paddingV: keyof ThemeTokens['spacing'];
    paddingH: keyof ThemeTokens['spacing'];
    text: keyof ThemeTokens['typography']['sizes'];
  }
> = {
  sm: { paddingV: 2, paddingH: 4, text: 'sm' },
  md: { paddingV: 3, paddingH: 5, text: 'md' },
  lg: { paddingV: 4, paddingH: 6, text: 'lg' },
};

/**
 * Props for {@link AppButton}.
 *
 * `label` doubles as the default `accessibilityLabel` (overridable) and as the
 * visible text, so a button is never shipped without an announceable name.
 */
export interface AppButtonProps extends Omit<
  AppPressableProps,
  'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'
> {
  /** Visible button text and default screen-reader name. */
  label: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  /** Shows a spinner, hides the label, and blocks presses. */
  loading?: boolean;
  /** Stretch to fill the available width. */
  fullWidth?: boolean;
  /** Override the spoken name when it should differ from `label`. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

function buildContainerStyle(
  theme: ThemeTokens,
  spec: (typeof SIZE_SPEC)[AppButtonSize],
  colors: ResolvedColors,
  fullWidth: boolean,
  isDisabled: boolean,
): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[spec.paddingV],
    paddingHorizontal: theme.spacing[spec.paddingH],
    borderRadius: theme.radii.md,
    backgroundColor: colors.background,
    borderWidth: colors.border ? 1 : 0,
    borderColor: colors.border,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    opacity: isDisabled ? 0.5 : 1,
  };
}

export function AppButton({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled = false,
  accessibilityLabel,
  style,
  ...rest
}: AppButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const spec = SIZE_SPEC[size];
  const colors = resolveVariantColors(theme, BUTTON_VARIANTS[variant]);
  const textSize = theme.typography.sizes[spec.text];

  const containerStyle = useMemo<ViewStyle>(
    () => buildContainerStyle(theme, spec, colors, fullWidth, isDisabled),
    [theme, spec, colors, fullWidth, isDisabled],
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
    <AppPressable
      accessibilityRole={A11Y_ROLES.button}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        containerStyle,
        state.pressed && !isDisabled ? styles.pressed : null,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={colors.foreground}
          accessibilityElementsHidden
        />
      ) : (
        <AppText variant="label" style={labelStyle} numberOfLines={1}>
          {label}
        </AppText>
      )}
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
});
