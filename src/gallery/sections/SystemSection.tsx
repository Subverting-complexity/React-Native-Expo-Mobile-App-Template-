import { useState } from 'react';

import { GalleryStack } from '../layout';
import { AppButton, AppErrorBoundary, AppSection, AppText } from '@/components';

/** Throws on demand so the error boundary has something to catch. */
function Bomb({ explode }: { explode: boolean }) {
  if (explode) {
    throw new Error('Demo error from the gallery.');
  }
  return <AppText>Component is healthy. Press “Break it” to throw.</AppText>;
}

/**
 * Showcases `AppErrorBoundary`: the "Break it" button makes the wrapped child
 * throw, the boundary catches it and renders a themed fallback, and "Reset"
 * clears the error and restores the child. The whole gallery itself sits inside
 * an `AppScreenContainer`, the screen-level wrapper.
 */
export function SystemSection() {
  const [explode, setExplode] = useState(false);

  return (
    <AppSection
      title="System"
      description="AppErrorBoundary catches render errors and shows a themed fallback. The screen uses AppScreenContainer."
    >
      <GalleryStack>
        <AppErrorBoundary
          fallback={({ error, reset }) => (
            <GalleryStack>
              <AppText tone="error">Caught: {error.message}</AppText>
              <AppButton
                label="Reset"
                variant="secondary"
                onPress={() => {
                  setExplode(false);
                  reset();
                }}
              />
            </GalleryStack>
          )}
        >
          <Bomb explode={explode} />
        </AppErrorBoundary>
        <AppButton label="Break it" variant="danger" onPress={() => setExplode(true)} />
      </GalleryStack>
    </AppSection>
  );
}
