import { GalleryRow, GalleryStack, noop } from '../layout';
import { GlyphNode, glyphIcon } from '../DemoIcon';
import { A11Y_ROLES } from '@/a11y';
import {
  AppBackButton,
  AppButton,
  AppIconButton,
  AppLinkButton,
  AppPressable,
  AppSection,
  AppText,
} from '@/components';
import type {
  AppBackButtonSize,
  AppButtonSize,
  AppButtonVariant,
  AppIconButtonVariant,
} from '@/components';

const BUTTON_VARIANTS: AppButtonVariant[] = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'danger',
];

const BUTTON_SIZES: AppButtonSize[] = ['sm', 'md', 'lg'];

const ICON_VARIANTS: AppIconButtonVariant[] = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'danger',
];

const BACK_SIZES: AppBackButtonSize[] = ['sm', 'md', 'lg'];

/**
 * Showcases the action controls — `AppButton`, `AppIconButton`, `AppLinkButton`,
 * `AppBackButton`, and the `AppPressable` foundation. Variants, sizes, and the
 * loading/disabled states all render from token-driven props.
 */
export function ActionsSection() {
  return (
    <AppSection
      title="Actions"
      description="Buttons, icon buttons, links, and the pressable foundation."
    >
      <GalleryStack>
        <AppText variant="label">Button variants</AppText>
        <GalleryRow>
          {BUTTON_VARIANTS.map((variant) => (
            <AppButton
              key={variant}
              label={variant}
              variant={variant}
              onPress={noop}
            />
          ))}
        </GalleryRow>

        <AppText variant="label">Button sizes</AppText>
        <GalleryRow>
          {BUTTON_SIZES.map((size) => (
            <AppButton key={size} label={size} size={size} onPress={noop} />
          ))}
        </GalleryRow>

        <AppText variant="label">Button states</AppText>
        <GalleryRow>
          <AppButton label="Loading" loading onPress={noop} />
          <AppButton label="Disabled" disabled onPress={noop} />
        </GalleryRow>
        <AppButton label="Full width" fullWidth onPress={noop} />

        <AppText variant="label">Icon buttons</AppText>
        <GalleryRow>
          {ICON_VARIANTS.map((variant) => (
            <AppIconButton
              key={variant}
              variant={variant}
              icon={glyphIcon('★')}
              accessibilityLabel={`${variant} icon button`}
              onPress={noop}
            />
          ))}
          <AppIconButton
            round
            icon={glyphIcon('＋')}
            accessibilityLabel="Add (round)"
            onPress={noop}
          />
          <AppIconButton
            loading
            icon={glyphIcon('★')}
            accessibilityLabel="Loading icon button"
            onPress={noop}
          />
        </GalleryRow>

        <AppText variant="label">Links</AppText>
        <GalleryRow>
          <AppLinkButton label="Default link" onPress={noop} />
          <AppLinkButton label="Underlined" underline onPress={noop} />
          <AppLinkButton
            label="With icon"
            leading={<GlyphNode glyph="↗" tone="accent" />}
            onPress={noop}
          />
        </GalleryRow>

        <AppText variant="label">Back button</AppText>
        <GalleryRow>
          {BACK_SIZES.map((size) => (
            <AppBackButton key={size} size={size} label={size} onPress={noop} />
          ))}
        </GalleryRow>

        <AppText variant="label">Pressable (foundation)</AppText>
        <AppPressable
          accessibilityRole={A11Y_ROLES.button}
          accessibilityLabel="Raw pressable sample"
          onPress={noop}
        >
          <AppText>Press me</AppText>
        </AppPressable>
      </GalleryStack>
    </AppSection>
  );
}
