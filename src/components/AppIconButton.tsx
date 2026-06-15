import { useMemo, type ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppPressable, type AppPressableProps } from './AppPressable';
import { A11Y_ROLES } from '@/a11y';
import { useTheme } from '@/theme';
import type { ColorPalette, ThemeTokens } from '@/theme';

export type AppIconButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

export type AppIconButtonSize = 'sm' | 'md' | 'lg';

interface VariantColors {
  /** Background fill colour token. */
  background: keyof ColorPalette | 'transparent';
  /** Icon (foreground) colour token. */
  foreground: keyof ColorPalette;
  /** Border colour token, or `null` for no border. */
  border: keyof ColorPalette | null;
}

const VARIANTS: Record<AppIconButtonVariant, VariantColors> = {
  primary: { background: 'primary', foreground: 'onPrimary', border: null },
  secondary: { background: 'secondary', foreground: 'onSecondary', border: null },
  outline: { background: 'transparent', foreground: 'primary', border: 'primary' },
  ghost: { background: 'transparent', foreground: 'primary', border: null },
  danger: { background: 'error', foreground: 'onError', border: null },
};

/**
 * Per-size spec. Padding comes from the spacing scale; the icon glyph size
 * tracks the typography size scale so it stays a single-source token rather
 * than a hardcoded pixel value.
 */
const SIZE_SPEC: Record<
  AppIconButtonSize,
  { padding: keyof ThemeTokens['spacing']; icon: keyof ThemeTokens['typography']['sizes'] }
> = {
  sm: { padding: 2, icon: 'lg' },
  md: { padding: 3, icon: '2xl' },
  lg: { padding: 4, icon: '3xl' },
};

/** Args passed to an `icon` render function so the glyph matches the button. */
export interface AppIconRenderProps {
  /** Resolved foreground colour for the current variant. */
  color: string;
  /** Resolved glyph size for the current `size`. */
  size: number;
}

/** An icon node, or a function that builds one from the resolved colour/size. */
export type AppIcon = ReactNode | ((props: AppIconRenderProps) => ReactNode);

/**
 * Props for {@link AppIconButton}.
 *
 * Icon-only, so `accessibilityLabel` is required (there is no visible text to
 * fall back on). The button is icon-library-agnostic: pass any element as
 * `icon`, or a render function that receives the resolved `{ color, size }`.
 */
export interface AppIconButtonProps
  extends Omit<
    AppPressableProps,
    'accessibilityRole' | 'children' | 'style'
  > {
  /** Icon element, or a builder receiving the resolved colour and size. */
  icon: AppIcon;
  variant?: AppIconButtonVariant;
  size?: AppIconButtonSize;
  /** Shows a spinner in place of the icon and blocks presses. */
  loading?: boolean;
  /** Render as a circle (`radii.full`) rather than the default rounded square. */
  round?: boolean;
  style?: StyleProp<ViewStyle>;
}

interface ResolvedColors {
  background: string;
  foreground: string;
  border: string | undefined;
}

function resolveColors(theme: ThemeTokens, v: VariantColors): ResolvedColors {
  return {
    background:
      v.background === 'transparent' ? 'transparent' : theme.colors[v.background],
    foreground: theme.colors[v.foreground],
    border: v.border ? theme.colors[v.border] : undefined,
  };
}

function buildContainerStyle(
  theme: ThemeTokens,
  padding: number,
  radius: number,
  colors: ResolvedColors,
  isDisabled: boolean,
): ViewStyle {
  return {
    alignItems: 'center',
    justifyContent: 'center',
    padding,
    borderRadius: radius,
    backgroundColor: colors.background,
    borderWidth: colors.border ? 1 : 0,
    borderColor: colors.border,
    opacity: isDisabled ? 0.5 : 1,
  };
}

/**
 * Theme-driven icon-only button. Builds on {@link AppPressable} so it inherits
 * the 44×44 touch-target floor and required accessibility wiring. Every colour,
 * spacing, and radius value comes from `useTheme()` tokens; the icon itself is
 * supplied by the caller, keeping the component free of any icon dependency.
 */
export function AppIconButton({
  icon,
  variant = 'primary',
  size = 'md',
  loading = false,
  round = false,
  disabled = false,
  style,
  ...rest
}: AppIconButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const spec = SIZE_SPEC[size];
  const colors = resolveColors(theme, VARIANTS[variant]);
  const iconSize = theme.typography.sizes[spec.icon].fontSize;
  const radius = round ? theme.radii.full : theme.radii.md;

  const containerStyle = useMemo<ViewStyle>(
    () =>
      buildContainerStyle(theme, theme.spacing[spec.padding], radius, colors, isDisabled),
    [theme, spec.padding, radius, colors, isDisabled],
  );

  const renderedIcon =
    typeof icon === 'function'
      ? icon({ color: colors.foreground, size: iconSize })
      : icon;

  return (
    <AppPressable
      accessibilityRole={A11Y_ROLES.button}
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
          size="small"
          accessibilityElementsHidden
        />
      ) : (
        renderedIcon
      )}
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
});
