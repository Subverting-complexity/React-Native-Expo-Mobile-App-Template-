import { View } from 'react-native';

import { GalleryRow, GalleryStack } from '../layout';
import { AppSection, AppText } from '@/components';
import type { TextTone } from '@/components';
import { useTheme } from '@/theme';
import type { TextVariantName } from '@/theme';

/** Every typography variant, largest to smallest. */
const VARIANTS: TextVariantName[] = [
  'display',
  'title',
  'heading',
  'subheading',
  'body',
  'bodySmall',
  'label',
  'caption',
];

/** Tones that read against the default background (inverse is shown separately). */
const TONES: TextTone[] = [
  'primary',
  'secondary',
  'disabled',
  'accent',
  'success',
  'warning',
  'error',
  'info',
];

/**
 * Showcases `AppText`: the semantic typography scale and the colour tones. Every
 * sample picks a `variant`/`tone` token — no font size, family, or colour is
 * written here.
 */
export function TypographySection() {
  const { theme } = useTheme();
  return (
    <AppSection
      title="Typography"
      description="AppText — semantic type scale and colour tones."
    >
      <GalleryStack>
        {VARIANTS.map((variant) => (
          <AppText key={variant} variant={variant}>
            {variant}
          </AppText>
        ))}
        <GalleryRow>
          {TONES.map((tone) => (
            <AppText key={tone} tone={tone}>
              {tone}
            </AppText>
          ))}
        </GalleryRow>
        <View
          style={{
            backgroundColor: theme.colors.primary,
            padding: theme.spacing[2],
            borderRadius: theme.radii.sm,
            alignSelf: 'flex-start',
          }}
        >
          <AppText tone="inverse">inverse (on a dark surface)</AppText>
        </View>
      </GalleryStack>
    </AppSection>
  );
}
