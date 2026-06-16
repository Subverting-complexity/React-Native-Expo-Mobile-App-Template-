import { AppScreenContainer, AppText } from '@/components';

/**
 * Settings tab. A placeholder that reserves the route and the themed screen
 * shell; the theme toggle and font-scale controls are built in their own
 * story (#34).
 */
export default function SettingsScreen() {
  return (
    <AppScreenContainer testID="settings-screen">
      <AppText variant="title" accessibilityRole="header">
        Settings
      </AppText>
      <AppText variant="body" tone="secondary">
        Settings tab.
      </AppText>
    </AppScreenContainer>
  );
}
