import { useState } from 'react';

import { GalleryRow, GalleryStack, noop } from '../layout';
import { GlyphNode } from '../DemoIcon';
import {
  AppCard,
  AppEmptyState,
  AppListItem,
  AppSection,
  AppText,
} from '@/components';
import type { AppCardVariant } from '@/components';

const CARD_VARIANTS: AppCardVariant[] = ['elevated', 'outlined', 'filled'];

/**
 * Showcases the surface and grouping components — `AppCard` (static and
 * tappable), `AppListItem` (static and pressable rows), and `AppEmptyState`. The
 * tappable card increments a counter so its interactivity is visible.
 */
export function SurfacesSection() {
  const [taps, setTaps] = useState(0);

  return (
    <AppSection
      title="Surfaces"
      description="AppCard, AppListItem, and AppEmptyState."
    >
      <GalleryStack>
        <AppText variant="label">Card variants</AppText>
        <GalleryRow>
          {CARD_VARIANTS.map((variant) => (
            <AppCard key={variant} variant={variant}>
              <AppText>{variant}</AppText>
            </AppCard>
          ))}
        </GalleryRow>

        <AppText variant="label">Tappable card</AppText>
        <AppCard
          onPress={() => setTaps((value) => value + 1)}
          accessibilityLabel="Tappable card"
        >
          <AppText>Tapped {taps} times</AppText>
        </AppCard>

        <AppText variant="label">List items</AppText>
        <AppListItem title="Static row" subtitle="No press handler" />
        <AppListItem
          title="Pressable row"
          subtitle="Leading and trailing slots"
          leading={<GlyphNode glyph="◉" tone="accent" />}
          trailing={<GlyphNode glyph="›" />}
          onPress={noop}
        />

        <AppText variant="label">Empty state</AppText>
        <AppEmptyState
          icon={<GlyphNode glyph="∅" tone="secondary" />}
          title="Nothing here yet"
          subtitle="Items you add will show up in this space."
          actionLabel="Add the first item"
          onAction={noop}
        />
      </GalleryStack>
    </AppSection>
  );
}
