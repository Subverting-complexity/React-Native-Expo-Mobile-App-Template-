import { useMemo, type ReactNode } from 'react';
import {
  View,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppPressable } from './AppPressable';
import { AppText } from './AppText';
import { A11Y_ROLES } from '@/a11y';
import { useTheme } from '@/theme';
import type { ThemeTokens } from '@/theme';

interface BaseProps {
  /** Primary line of the row. */
  title: string;
  /** Optional secondary line shown beneath the title. */
  subtitle?: string;
  /** Optional element rendered before the text (icon, avatar, …). */
  leading?: ReactNode;
  /** Optional element rendered after the text (chevron, switch, badge, …). */
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Optional test/automation id applied to the row. */
  testID?: string;
}

interface StaticListItemProps extends BaseProps {
  onPress?: undefined;
}

interface PressableListItemProps extends BaseProps {
  /** When provided the whole row becomes a single tappable surface. */
  onPress: () => void;
  /** Required once the row is interactive — names it for screen readers. Defaults to `title`. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Defaults to `button`. */
  accessibilityRole?: AccessibilityRole;
  disabled?: boolean;
}

export type AppListItemProps = StaticListItemProps | PressableListItemProps;

/** Builds the shared row layout (leading · text · trailing). */
function useRowStyle(theme: ThemeTokens): ViewStyle {
  return useMemo<ViewStyle>(
    () => ({
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[4],
    }),
    [theme],
  );
}

/** The leading/text/trailing content, shared by the static and pressable rows. */
function RowContent({
  title,
  subtitle,
  leading,
  trailing,
}: Pick<BaseProps, 'title' | 'subtitle' | 'leading' | 'trailing'>) {
  return (
    <>
      {leading != null ? <View>{leading}</View> : null}
      <View style={{ flex: 1 }}>
        <AppText variant="body">{title}</AppText>
        {subtitle ? (
          <AppText variant="bodySmall" tone="secondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing != null ? <View>{trailing}</View> : null}
    </>
  );
}

/**
 * A single row in a list. Static by default; passing `onPress` upgrades it to an
 * {@link AppPressable}, which forces an accessibility label (defaulting to the
 * title) and the 44×44 touch floor. Layout, spacing, and type all come from
 * `useTheme()` tokens.
 */
export function AppListItem(props: AppListItemProps) {
  const { title, subtitle, leading, trailing, style, testID } = props;
  const { theme } = useTheme();
  const rowStyle = useRowStyle(theme);

  const content = (
    <RowContent
      title={title}
      subtitle={subtitle}
      leading={leading}
      trailing={trailing}
    />
  );

  if (props.onPress) {
    return (
      <AppPressable
        accessibilityRole={props.accessibilityRole ?? A11Y_ROLES.button}
        accessibilityLabel={props.accessibilityLabel ?? title}
        accessibilityHint={props.accessibilityHint}
        disabled={props.disabled}
        onPress={props.onPress}
        testID={testID}
        // Reset AppPressable's centering floor so the row lays out left-to-right.
        style={[
          { alignItems: 'center', justifyContent: 'flex-start' },
          rowStyle,
          style,
        ]}
      >
        {content}
      </AppPressable>
    );
  }

  return (
    <View style={[rowStyle, style]} testID={testID}>
      {content}
    </View>
  );
}
