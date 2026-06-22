import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { useTheme } from '@/theme';

export interface AppEmptyStateProps {
  /** Headline explaining the empty state (e.g. "No items yet"). */
  title: string;
  /** Optional supporting line beneath the title. */
  subtitle?: string;
  /** Optional element rendered above the title (an illustration or icon). */
  icon?: ReactNode;
  /** Optional call-to-action label. Renders a button only when paired with `onAction`. */
  actionLabel?: string;
  /** Handler for the call-to-action button. */
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Optional test/automation id applied to the wrapper. */
  testID?: string;
}

/**
 * Centered placeholder shown when a list or screen has no content. Composes an
 * optional icon slot, a title, an optional subtitle, and an optional action
 * button. All spacing and type come from `useTheme()` tokens; the action reuses
 * {@link AppButton}, so it inherits the required accessibility wiring and touch
 * floor.
 */
export function AppEmptyState({
  title,
  subtitle,
  icon,
  actionLabel,
  onAction,
  style,
  testID,
}: AppEmptyStateProps) {
  const { theme } = useTheme();

  const showAction = actionLabel != null && onAction != null;

  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing[3],
          padding: theme.spacing[6],
        },
        style,
      ]}
      testID={testID}
    >
      {icon != null ? <View>{icon}</View> : null}
      <AppText variant="heading" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText
          variant="body"
          tone="secondary"
          style={{ textAlign: 'center' }}
        >
          {subtitle}
        </AppText>
      ) : null}
      {showAction ? (
        <View style={{ marginTop: theme.spacing[2] }}>
          <AppButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
