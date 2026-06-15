import { useMemo, type ReactNode } from 'react';
import {
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export interface AppScreenContainerProps {
  children?: ReactNode;
  /** Wrap content in a vertical `ScrollView`. Defaults to `false`. */
  scroll?: boolean;
  /** Apply standard screen padding (spacing token `4`). Defaults to `true`. */
  padded?: boolean;
  /** Safe-area edges to inset. Defaults to all edges. */
  edges?: readonly Edge[];
  /** Style for the safe-area root. */
  style?: StyleProp<ViewStyle>;
  /** Style for the inner content (the scroll content container when scrolling). */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Optional test/automation id applied to the safe-area root. */
  testID?: string;
}

const DEFAULT_EDGES: readonly Edge[] = ['top', 'right', 'bottom', 'left'];

/**
 * Screen-level wrapper: applies the themed background, safe-area insets, and
 * optional scrolling/padding. The background colour comes from `useTheme()`
 * tokens so every screen re-skins centrally. Status-bar styling is owned by
 * the root layout, not here.
 */
export function AppScreenContainer({
  children,
  scroll = false,
  padded = true,
  edges = DEFAULT_EDGES,
  style,
  contentContainerStyle,
  testID,
}: AppScreenContainerProps) {
  const { theme } = useTheme();

  const rootStyle = useMemo<ViewStyle>(
    () => ({ flex: 1, backgroundColor: theme.colors.background }),
    [theme],
  );

  const contentStyle = useMemo<ViewStyle>(
    () => (padded ? { padding: theme.spacing[4] } : {}),
    [theme, padded],
  );

  const contentTestID = testID ? `${testID}-content` : undefined;

  return (
    <SafeAreaView style={[rootStyle, style]} edges={edges} testID={testID}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[contentStyle, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          testID={contentTestID}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[{ flex: 1 }, contentStyle, contentContainerStyle]}
          testID={contentTestID}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
