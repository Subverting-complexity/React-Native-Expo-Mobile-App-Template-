import { useMemo, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { AppPressable, type AppPressableProps } from './AppPressable';
import { AppText } from './AppText';
import { A11Y_ROLES } from '@/a11y';
import { useTheme } from '@/theme';
import type { ThemeTokens } from '@/theme';

export type AppChipSize = 'sm' | 'md';

export type AppChipRole = typeof A11Y_ROLES.button | typeof A11Y_ROLES.radio;

const SIZE_SPEC: Record<
  AppChipSize,
  {
    paddingH: keyof ThemeTokens['spacing'];
    paddingV: keyof ThemeTokens['spacing'];
    text: keyof ThemeTokens['typography']['sizes'];
  }
> = {
  sm: { paddingH: 3, paddingV: 1, text: 'sm' },
  md: { paddingH: 4, paddingV: 2, text: 'md' },
};

/**
 * Props for {@link AppChip}.
 *
 * A single selectable filter chip. `selected` drives both the visual fill and
 * the announced `selected` accessibility state, so screen-reader users hear the
 * toggle state. `label` doubles as the default spoken name.
 */
export interface AppChipProps extends Omit<
  AppPressableProps,
  'accessibilityRole' | 'accessibilityLabel' | 'children' | 'style'
> {
  /** Visible chip text and default screen-reader name. */
  label: string;
  /** Selected (active) state: fills the chip and sets the announced state. */
  selected?: boolean;
  size?: AppChipSize;
  /** Optional element rendered before the label. */
  leading?: ReactNode;
  /** Optional element rendered after the label. */
  trailing?: ReactNode;
  /** Override the spoken name when it should differ from `label`. */
  accessibilityLabel?: string;
  /** `radio` in a single-select group, which announces `checked` instead of `selected`. */
  accessibilityRole?: AppChipRole;
  style?: StyleProp<ViewStyle>;
}

interface ChipColors {
  background: string;
  foreground: string;
  border: string | undefined;
}

function resolveColors(theme: ThemeTokens, selected: boolean): ChipColors {
  return selected
    ? {
        background: theme.colors.primary,
        foreground: theme.colors.onPrimary,
        border: undefined,
      }
    : {
        background: theme.colors.surfaceVariant,
        foreground: theme.colors.textPrimary,
        border: theme.colors.border,
      };
}

/**
 * Theme-driven selectable filter chip. Builds on {@link AppPressable} for the
 * 44×44 touch floor and required accessibility wiring. Colours, spacing, radius,
 * and type all come from `useTheme()` tokens; selection swaps token sets rather
 * than hardcoding any value.
 */
export function AppChip({
  label,
  selected = false,
  size = 'md',
  leading,
  trailing,
  disabled = false,
  accessibilityLabel,
  accessibilityRole = A11Y_ROLES.button,
  style,
  ...rest
}: AppChipProps) {
  const { theme } = useTheme();
  const isDisabled = disabled ?? false;
  const spec = SIZE_SPEC[size];
  const colors = resolveColors(theme, selected);

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[1],
      paddingHorizontal: theme.spacing[spec.paddingH],
      paddingVertical: theme.spacing[spec.paddingV],
      borderRadius: theme.radii.full,
      backgroundColor: colors.background,
      borderWidth: colors.border ? theme.borderWidths.thin : 0,
      borderColor: colors.border,
      opacity: isDisabled ? theme.opacity.disabled : 1,
    }),
    [theme, spec, colors, isDisabled],
  );

  return (
    <AppPressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={
        accessibilityRole === A11Y_ROLES.radio
          ? { checked: selected, disabled: isDisabled }
          : { selected, disabled: isDisabled }
      }
      disabled={isDisabled}
      style={(state) => [
        // Reset AppPressable's square 44×44 centering so the chip hugs content.
        { alignSelf: 'flex-start' },
        containerStyle,
        state.pressed && !isDisabled
          ? { opacity: theme.opacity.pressed }
          : null,
      ]}
      {...rest}
    >
      {leading != null ? <View>{leading}</View> : null}
      <AppText
        variant="label"
        size={spec.text}
        style={{ color: colors.foreground }}
        numberOfLines={1}
      >
        {label}
      </AppText>
      {trailing != null ? <View>{trailing}</View> : null}
    </AppPressable>
  );
}
