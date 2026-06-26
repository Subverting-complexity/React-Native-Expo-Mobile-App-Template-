import { GalleryStack } from './layout';
import { ActionsSection } from './sections/ActionsSection';
import { FeedbackSection } from './sections/FeedbackSection';
import { FormsSection } from './sections/FormsSection';
import { SelectionSection } from './sections/SelectionSection';
import { SurfacesSection } from './sections/SurfacesSection';
import { SystemSection } from './sections/SystemSection';
import { TypographySection } from './sections/TypographySection';
import { AppBackButton, AppScreenContainer, AppText } from '@/components';

export interface ComponentGalleryProps {
  /**
   * Optional back handler. When provided, a back control renders at the top of
   * the screen. Injected by the route so the gallery stays decoupled from the
   * router and unit-testable in isolation.
   */
  onBack?: () => void;
}

/**
 * Living documentation screen: renders every `App*` component, grouped by
 * purpose, each with its variants and interactive states. Scrolls within an
 * `AppScreenContainer` and reads all spacing from theme tokens.
 */
export function ComponentGallery({ onBack }: ComponentGalleryProps) {
  return (
    <AppScreenContainer scroll testID="component-gallery">
      <GalleryStack gap={6}>
        {onBack ? (
          <AppBackButton
            label="Back"
            accessibilityLabel="Back to previous screen"
            onPress={onBack}
          />
        ) : null}
        <GalleryStack gap={1}>
          <AppText variant="display">Component Gallery</AppText>
          <AppText variant="body" tone="secondary">
            Every App* component with its variants — living documentation for
            the template.
          </AppText>
        </GalleryStack>
        <TypographySection />
        <ActionsSection />
        <SelectionSection />
        <FormsSection />
        <SurfacesSection />
        <FeedbackSection />
        <SystemSection />
      </GalleryStack>
    </AppScreenContainer>
  );
}
