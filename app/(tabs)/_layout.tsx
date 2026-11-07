import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  TABS,
  TAB_NAMES,
  outlineIcon,
  tabBarContentHeight,
  type TabDefinition,
  type TabIconName,
} from '@/navigation';
import { useTheme } from '@/theme';

/** Tab icon: the filled glyph on the active tab, the outline on the others. */
function tabIcon(icon: TabIconName) {
  function TabIcon({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: ColorValue;
    size: number;
  }) {
    return (
      <Ionicons
        name={focused ? icon : outlineIcon(icon)}
        color={color}
        size={size}
      />
    );
  }
  return TabIcon;
}

/**
 * Bottom-tab navigator. The tabs, their order, labels and icons come from
 * `TABS` in `src/navigation/`.
 *
 * Every colour is read from `useTheme()` tokens so the tab bar and header
 * re-skin centrally with the rest of the app — nothing here hardcodes a
 * colour. `tabBarAccessibilityLabel` gives each tab its full title for screen
 * readers, because the visible labels are short. The tab role already says "tab".
 */
export default function TabsLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { variants, sizes } = theme.typography;
  const tabLabel = sizes[variants.caption.size];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        // A custom height replaces the default one, so it must add the bottom
        // safe area itself.
        tabBarStyle: {
          height: tabBarContentHeight(theme) + insets.bottom,
          paddingTop: theme.spacing[1],
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: variants.caption.family,
          fontSize: tabLabel.fontSize,
          lineHeight: tabLabel.lineHeight,
        },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { fontFamily: variants.subheading.family },
        headerShadowVisible: false,
      }}
    >
      {TAB_NAMES.map((name) => {
        const tab: TabDefinition = TABS[name];
        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: tab.title,
              tabBarLabel: tab.label ?? tab.title,
              tabBarAccessibilityLabel: tab.title,
              tabBarIcon: tabIcon(tab.icon),
            }}
          />
        );
      })}
    </Tabs>
  );
}
