import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppBadge, AppScreenContainer, AppText } from '@/components';
import { TABS, outlineIcon, type TabName } from '@/navigation';
import { spacing as spacingScale, useTheme, withAlpha } from '@/theme';

// About 45 characters a line at body size, so the sentence does not run edge to edge.
const DESCRIPTION_MAX_WIDTH = spacingScale[24] * 3;

export interface FeaturePlaceholderProps {
  /** The tab this page stands in for. Its title and icon come from `TABS`. */
  tab: TabName;
  /** One short sentence that says what the screen will do. */
  description: string;
  /** A faded sketch of the screen's content. Decorative only. */
  preview: ReactNode;
  testID?: string;
}

/**
 * The page a tab shows until its feature is built: an icon, the screen name,
 * one sentence, a "Coming soon" badge, and a faded preview of the content.
 */
export function FeaturePlaceholder({
  tab,
  description,
  preview,
  testID,
}: FeaturePlaceholderProps) {
  const { theme } = useTheme();
  const { colors, spacing, radii, borderWidths, opacity } = theme;
  const { title, icon } = TABS[tab];

  return (
    <AppScreenContainer scroll edges={['left', 'right']} testID={testID}>
      <View
        style={{
          alignItems: 'center',
          gap: spacing[3],
          paddingTop: spacing[8],
        }}
      >
        <View
          aria-hidden
          style={{
            width: spacing[20],
            height: spacing[20],
            borderRadius: radii.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: withAlpha(colors.primary, 0.14),
          }}
        >
          <Ionicons
            name={outlineIcon(icon)}
            size={theme.iconSizes.xl}
            color={colors.primary}
          />
        </View>
        {/* The tab header already announces the title as a heading. */}
        <AppText variant="title" style={{ textAlign: 'center' }}>
          {title}
        </AppText>
        <AppText
          variant="body"
          tone="secondary"
          style={{ textAlign: 'center', maxWidth: DESCRIPTION_MAX_WIDTH }}
        >
          {description}
        </AppText>
        <AppBadge
          label="Coming soon"
          tone="primary"
          variant="soft"
          style={{ alignSelf: 'center' }}
        />
      </View>

      <View
        aria-hidden
        style={{
          marginTop: spacing[8],
          padding: spacing[4],
          borderRadius: radii.xl,
          borderWidth: borderWidths.thin,
          borderColor: colors.borderSubtle,
          backgroundColor: colors.surface,
          opacity: opacity.faded,
        }}
      >
        {preview}
      </View>
    </AppScreenContainer>
  );
}
