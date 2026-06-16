import { Tabs } from 'expo-router';

import { useTheme } from '@/theme';

/**
 * Bottom-tab navigator for the starter app: a Home tab and a Settings tab.
 *
 * Every colour is read from `useTheme()` tokens so the tab bar and header
 * re-skin centrally with the rest of the app — nothing here hardcodes a
 * colour. No icon library is bundled, so tabs are identified by accessible
 * text labels (`title`), which also drives the screen-reader announcement;
 * `tabBarAccessibilityLabel` makes the role explicit.
 */
export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarAccessibilityLabel: 'Home tab' }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
    </Tabs>
  );
}
