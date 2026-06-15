import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { A11Y_ROLES } from '@/a11y';
import { useTheme } from '@/theme';

export interface AppSectionProps {
  /** Optional section title, announced as a heading for rotor navigation. */
  title?: string;
  /** Optional supporting copy shown beneath the title. */
  description?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Optional test/automation id applied to the section wrapper. */
  testID?: string;
}

/**
 * Groups related content under an optional heading and description. The title
 * carries the `header` accessibility role so screen-reader users can jump
 * between sections with the rotor. Spacing and type come from `useTheme()`
 * tokens; the section adds no background of its own, so it composes inside any
 * surface (a screen, an {@link AppCard}, …).
 */
export function AppSection({
  title,
  description,
  children,
  style,
  testID,
}: AppSectionProps) {
  const { theme } = useTheme();

  const hasHeader = title != null || description != null;

  return (
    <View style={[{ gap: theme.spacing[3] }, style]} testID={testID}>
      {hasHeader ? (
        <View style={{ gap: theme.spacing[1] }}>
          {title ? (
            <AppText variant="subheading" accessibilityRole={A11Y_ROLES.header}>
              {title}
            </AppText>
          ) : null}
          {description ? (
            <AppText variant="bodySmall" tone="secondary">
              {description}
            </AppText>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}
