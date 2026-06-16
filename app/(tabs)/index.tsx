import { useRouter } from 'expo-router';

import { AppButton, AppScreenContainer, AppText } from '@/components';

/**
 * Home tab. A minimal placeholder for the starter app — it establishes the
 * themed screen shell (`AppScreenContainer`) and token-driven typography
 * (`AppText`), and links out to the Component Gallery (#35).
 */
export default function HomeScreen() {
  const router = useRouter();
  return (
    <AppScreenContainer testID="home-screen">
      <AppText variant="title" accessibilityRole="header">
        Expo Template
      </AppText>
      <AppText variant="body" tone="secondary">
        Home tab.
      </AppText>
      <AppButton
        label="Open component gallery"
        onPress={() => router.push('/gallery')}
      />
    </AppScreenContainer>
  );
}
