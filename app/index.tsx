import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppButton, AppScreenContainer, AppText } from '@/components';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <AppScreenContainer>
      <View style={[styles.container, { gap: theme.spacing[4] }]}>
        <AppText variant="title">Expo Template</AppText>
        <AppButton
          label="Open component gallery"
          onPress={() => router.push('/gallery')}
        />
      </View>
    </AppScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
