import { useRouter } from 'expo-router';

import { AppButton, AppScreenContainer, AppText } from '@/components';

/**
 * Home tab. A minimal starting screen: it uses the themed screen shell
 * (`AppScreenContainer`) and token-driven typography (`AppText`), and links
 * to the Component Gallery. The tab header covers the top safe area, so the
 * container pads only the sides.
 */
export default function HomeScreen() {
  const router = useRouter();
  return (
    <AppScreenContainer edges={['left', 'right']} testID="home-screen">
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
