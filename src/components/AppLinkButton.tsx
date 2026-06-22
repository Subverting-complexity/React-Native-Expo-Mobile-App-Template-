import { useMemo, type ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { AppPressable, type AppPressableProps } from './AppPressable';
import { AppText, type TextTone } from './AppText';
import { A11Y_ROLES } from '@/a11y';
import { useTheme } from '@/theme';
import type { TextVariantName } from '@/theme';

export type AppLinkButtonSize = 'sm' | 'md' | 'lg';

/** Maps the size prop to a typography variant from the type scale. */
const SIZE_VARIANT: Record<AppLinkButtonSize, TextVariantName> = {
  sm: 'bodySmall',
  md: 'body',
  lg: 'subheading',
};

/**
 * Props for {@link AppLinkButton}.
 *
 * `label` doubles as the visible text and the default screen-reader name, so a
 * link is never shipped without an announceable name. It is announced with the
 * `link` role — reserve this for navigation (in-app route or external URL); use
 * {@link AppButton} for an in-place action.
 */
export interface AppLinkButtonProps extends Omit<
  AppPressableProps,
  'accessibilityRole' | 'accessibilityLabel' | 'children' | 'style'
> {
  /** Visible link text and default screen-reader name. */
  label: string;
  /** Semantic colour role. Defaults to `accent` (the primary brand colour). */
  tone?: TextTone;
  size?: AppLinkButtonSize;
  /** Underline the label. Off by default — colour already signals the link. */
  underline?: boolean;
  /** Optional element rendered before the label. */
  leading?: ReactNode;
  /** Optional element rendered after the label. */
  trailing?: ReactNode;
  /** Override the spoken name when it should differ from `label`. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Theme-driven textual link. Builds on {@link AppPressable} for the 44×44 touch
 * floor and required accessibility wiring, and on {@link AppText} for tone and
 * typography — so it never hardcodes a colour, size, or weight. Disabled links
 * drop to the `disabled` tone and stop firing presses.
 */
export function AppLinkButton({
  label,
  tone = 'accent',
  size = 'md',
  underline = false,
  leading,
  trailing,
  disabled = false,
  accessibilityLabel,
  style,
  ...rest
}: AppLinkButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled ?? false;

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

  const labelStyle = useMemo<TextStyle>(
    () => (underline ? { textDecorationLine: 'underline' } : {}),
    [underline],
  );

  return (
    <AppPressable
      accessibilityRole={A11Y_ROLES.link}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={(state) => [
        containerStyle,
        state.pressed && !isDisabled ? styles.pressed : null,
      ]}
      {...rest}
    >
      {leading != null ? <View>{leading}</View> : null}
      <AppText
        variant={SIZE_VARIANT[size]}
        tone={isDisabled ? 'disabled' : tone}
        style={labelStyle}
      >
        {label}
      </AppText>
      {trailing != null ? <View>{trailing}</View> : null}
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
});
