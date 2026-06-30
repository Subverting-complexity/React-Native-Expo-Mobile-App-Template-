import { useState } from 'react';

import { GalleryStack } from '../layout';
import { GlyphNode } from '../DemoIcon';
import { AppChip, AppChipGroup, AppSection, AppText } from '@/components';
import type { AppChipOption } from '@/components';

const OPTIONS: AppChipOption[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'archived', label: 'Archived', disabled: true },
];

/**
 * Showcases `AppChip` and `AppChipGroup`. Both groups are fully controlled, so
 * local state holds the selection and the chips reflect it live — the
 * single-select group clears on re-tap, the multi-select group toggles.
 */
export function SelectionSection() {
  const [single, setSingle] = useState<string | null>('all');
  const [multi, setMulti] = useState<string[]>(['unread']);
  const [pinned, setPinned] = useState(false);

  return (
    <AppSection
      title="Selection"
      description="AppChip and AppChipGroup — controlled single- and multi-select."
    >
      <GalleryStack>
        <AppText variant="label">Single-select (re-tap to clear)</AppText>
        <AppChipGroup options={OPTIONS} value={single} onChange={setSingle} />

        <AppText variant="label">Multi-select</AppText>
        <AppChipGroup
          multiple
          options={OPTIONS}
          values={multi}
          onChange={setMulti}
        />

        <AppText variant="label">Standalone chip with leading icon</AppText>
        <AppChip
          label={pinned ? 'Pinned' : 'Pin'}
          selected={pinned}
          leading={<GlyphNode glyph="★" />}
          accessibilityLabel="Toggle pinned"
          onPress={() => setPinned((value) => !value)}
        />
      </GalleryStack>
    </AppSection>
  );
}
