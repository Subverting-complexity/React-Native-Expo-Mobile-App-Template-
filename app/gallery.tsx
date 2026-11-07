import { useRouter } from 'expo-router';

import { ToastProvider } from '@/components';
import { ComponentGallery } from '@/gallery';

/**
 * Route wrapper for the Component Gallery. Stays thin: it wires the router's
 * back action into the gallery and leaves all rendering to `ComponentGallery`,
 * which is unit-testable without a router.
 *
 * The root layout lifts toasts above the tab bar. This route has no tab bar,
 * so it provides its own toasts at the bottom of the screen.
 */
export default function GalleryRoute() {
  const router = useRouter();
  return (
    <ToastProvider>
      <ComponentGallery onBack={() => router.back()} />
    </ToastProvider>
  );
}
