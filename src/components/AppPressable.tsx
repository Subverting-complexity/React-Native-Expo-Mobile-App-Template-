import { useMemo } from 'react';
import {
  Pressable,
  type AccessibilityRole,
  type AccessibilityState,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

/**
 * Props for {@link AppPressable}.
 *
 * Extends React Native's `Pressable` but makes `accessibilityLabel` and
 * `accessibilityRole` **required** — every interactive surface in the app
 * must be announceable to a screen reader. `accessibilityHint` and
 * `accessibilityState` stay optional.
 */
export interface AppPressableProps extends Omit<
  PressableProps,
  | 'accessibilityLabel'
  | 'accessibilityRole'
  | 'accessibilityState'
  | 'accessibilityHint'
> {
  /** Spoken description of what the control does. Required. */
  accessibilityLabel: string;
  /** Semantic role announced to assistive tech (e.g. `button`, `link`). Required. */
  accessibilityRole: AccessibilityRole;
  /** Optional supplementary hint read after the label. */
  accessibilityHint?: string;
  /** Optional state (selected, checked, expanded…). `disabled` is merged in automatically. */
  accessibilityState?: AccessibilityState;
}

/**
 * Foundation pressable that every interactive `App*` component builds on.
 *
 * Guarantees a minimum 44×44 touch target (read from the `a11y` theme
 * token, never hardcoded) and forces an accessibility label + role at the
 * type level. The 44×44 minimum is applied as a style floor before the
 * caller's style, and content is centered by default; callers extend
 * layout through `style` as usual.
 */
export function AppPressable({
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  accessibilityState,
  disabled,
  style,
  ...rest
}: AppPressableProps) {
  const { theme } = useTheme();
  const minTouchTarget = theme.a11y.minTouchTarget;

  const floor = useMemo<ViewStyle>(
    () => ({
      minWidth: minTouchTarget,
      minHeight: minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [minTouchTarget],
  );

  const isDisabled = disabled ?? accessibilityState?.disabled ?? false;
  const mergedState: AccessibilityState = {
    ...accessibilityState,
    disabled: isDisabled,
  };

  return (
    <Pressable
      accessible
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={mergedState}
      disabled={disabled}
      style={(state) => [
        floor,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    />
  );
}
