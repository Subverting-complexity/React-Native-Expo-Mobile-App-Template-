import { FeaturePlaceholder, ListPreview } from '@/placeholders';

/**
 * Explore tab. An example of a tab whose feature is not built yet: it shows
 * the "Coming soon" page. Replace the placeholder with the real screen, or
 * delete this file and its entry in `TABS` (`src/navigation/tabs.ts`).
 */
export default function ExploreScreen() {
  return (
    <FeaturePlaceholder
      testID="explore-screen"
      tab="explore"
      description="Browse everything the app has to offer."
      preview={<ListPreview />}
    />
  );
}
