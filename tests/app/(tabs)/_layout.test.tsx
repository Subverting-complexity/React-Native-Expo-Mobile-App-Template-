import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import TabsLayout from '../../../app/(tabs)/_layout';
import { TABS, TAB_NAMES, type TabDefinition } from '@/navigation';
import { ThemeProvider } from '@/theme';
import { makeStorage, renderHydrated } from '../../../src/test';

type TabIcon = (props: {
  focused: boolean;
  color: string;
  size: number;
}) => React.ReactElement<{ name: string }>;

interface TabOptions {
  title?: string;
  tabBarLabel?: string;
  tabBarAccessibilityLabel?: string;
  tabBarIcon?: TabIcon;
}

// Each rendered Tabs.Screen records its options here, so tests can read them.
const mockTabOptions: Record<string, TabOptions> = {};
// The navigator records its screenOptions here.
const mockScreenOptions: {
  current?: { tabBarLabelStyle?: Record<string, unknown> };
} = {};

// Render the Tabs navigator structurally: each Tabs.Screen surfaces its
// `title` as text and its `tabBarAccessibilityLabel` as the accessibility
// label, so the test can assert every tab is registered without booting a
// real navigator.
jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  const Tabs = ({
    children,
    screenOptions,
  }: {
    children: React.ReactNode;
    screenOptions?: typeof mockScreenOptions.current;
  }) => {
    mockScreenOptions.current = screenOptions;
    return React.createElement(React.Fragment, null, children);
  };
  Tabs.displayName = 'Tabs';
  const TabsScreen = ({
    name,
    options,
  }: {
    name: string;
    options?: TabOptions;
  }) => {
    mockTabOptions[name] = options ?? {};
    return React.createElement(
      Text,
      { accessibilityLabel: options?.tabBarAccessibilityLabel },
      options?.title ?? '',
    );
  };
  TabsScreen.displayName = 'Tabs.Screen';
  Tabs.Screen = TabsScreen;
  return { Tabs };
});

const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>
      <ThemeProvider storage={makeStorage()}>{children}</ThemeProvider>
    </SafeAreaProvider>
  );
}

function optionsOf(name: string): TabOptions {
  const options = mockTabOptions[name];
  if (!options) {
    throw new Error(`The ${name} tab was not registered`);
  }
  return options;
}

beforeEach(() => {
  for (const name of Object.keys(mockTabOptions)) {
    delete mockTabOptions[name];
  }
});

describe('TabsLayout', () => {
  it('registers every tab in TABS, in order, with its title', async () => {
    const { getByText } = await renderHydrated(<TabsLayout />, {
      wrapper: Wrapper,
    });
    expect(Object.keys(mockTabOptions)).toEqual(TAB_NAMES);
    for (const name of TAB_NAMES) {
      getByText(TABS[name].title);
    }
  });

  it('names each tab by its title only, because the tab role says "tab"', async () => {
    const { getByLabelText } = await renderHydrated(<TabsLayout />, {
      wrapper: Wrapper,
    });
    for (const name of TAB_NAMES) {
      getByLabelText(TABS[name].title);
    }
  });

  it('shows the short label under the icon, or the title when a tab has none', async () => {
    await renderHydrated(<TabsLayout />, { wrapper: Wrapper });
    for (const name of TAB_NAMES) {
      const tab: TabDefinition = TABS[name];
      expect(optionsOf(name).tabBarLabel).toBe(tab.label ?? tab.title);
    }
  });

  it('lets the tab label line height grow with the OS text size', async () => {
    // A fixed lineHeight does not scale with the font, so large labels clip.
    await renderHydrated(<TabsLayout />, { wrapper: Wrapper });
    const labelStyle = mockScreenOptions.current?.tabBarLabelStyle;
    expect(labelStyle).toBeDefined();
    expect(labelStyle).not.toHaveProperty('lineHeight');
  });

  it.each(TAB_NAMES)(
    'gives the %s tab a filled icon when active and an outline when not',
    async (name) => {
      await renderHydrated(<TabsLayout />, { wrapper: Wrapper });
      const { tabBarIcon } = optionsOf(name);
      if (!tabBarIcon) {
        throw new Error(`The ${name} tab has no icon`);
      }
      const props = { color: 'black', size: 24 };
      const { icon } = TABS[name];

      expect(tabBarIcon({ focused: true, ...props }).props.name).toBe(icon);
      expect(tabBarIcon({ focused: false, ...props }).props.name).toBe(
        `${icon}-outline`,
      );
    },
  );
});
