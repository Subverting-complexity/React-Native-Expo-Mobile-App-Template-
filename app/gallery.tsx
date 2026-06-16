import { useRouter } from 'expo-router';

import { ComponentGallery } from '@/gallery';

/**
 * Route wrapper for the Component Gallery. Stays thin: it wires the router's
 * back action into the gallery and leaves all rendering to `ComponentGallery`,
 * which is unit-testable without a router.
 */
export default function GalleryRoute() {
  const router = useRouter();
  return <ComponentGallery onBack={() => router.back()} />;
}
