import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import type { ThemeTokens } from '@/theme';

/** A spacing-scale key, so gaps stay token-sourced rather than hardcoded. */
type SpacingKey = keyof ThemeTokens['spacing'];

interface LayoutProps {
  children: ReactNode;
  /** Gap between children, as a spacing-scale token key. */
  gap?: SpacingKey;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Vertical stack with a token-sourced gap. Used throughout the gallery so the
 * spacing between rows reads from `useTheme()` and never a literal value.
 */
export function GalleryStack({
  children,
  gap = 3,
  style,
  testID,
}: LayoutProps) {
  const { theme } = useTheme();
  return (
    <View style={[{ gap: theme.spacing[gap] }, style]} testID={testID}>
      {children}
    </View>
  );
}

/**
 * Horizontal, wrapping row with a token-sourced gap. Keeps variant samples
 * laid out side by side without hardcoding the spacing between them.
 */
export function GalleryRow({ children, gap = 2, style, testID }: LayoutProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: theme.spacing[gap],
        },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

/** No-op press handler for samples whose only purpose is to show the control. */
export function noop(): void {}
