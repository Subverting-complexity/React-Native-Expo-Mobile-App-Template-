import { AppScreenContainer, AppText } from '@/components';

/**
 * Home tab. A minimal placeholder for the starter app — it establishes the
 * themed screen shell (`AppScreenContainer`) and token-driven typography
 * (`AppText`). Real home content is layered on later; the Component Gallery
 * lives in its own story (#35).
 */
export default function HomeScreen() {
  return (
    <AppScreenContainer testID="home-screen">
      <AppText variant="title" accessibilityRole="header">
        Expo Template
      </AppText>
      <AppText variant="body" tone="secondary">
        Home tab.
      </AppText>
    </AppScreenContainer>
  );
}
