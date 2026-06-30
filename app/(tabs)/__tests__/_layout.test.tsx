import { render } from '@testing-library/react-native';

import TabsLayout from '../_layout';
import { ThemeProvider } from '@/theme';
import { makeStorage } from '../../../src/test';

// Render the Tabs navigator structurally: each Tabs.Screen surfaces its
// `title` as text and its `tabBarAccessibilityLabel` as the accessibility
// label, so the test can assert both tabs are registered without booting a
// real navigator.
jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  const Tabs = ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  Tabs.displayName = 'Tabs';
  const TabsScreen = ({
    options,
  }: {
    options?: { title?: string; tabBarAccessibilityLabel?: string };
  }) =>
    React.createElement(
      Text,
      { accessibilityLabel: options?.tabBarAccessibilityLabel },
      options?.title ?? '',
    );
  TabsScreen.displayName = 'Tabs.Screen';
  Tabs.Screen = TabsScreen;
  return { Tabs };
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider storage={makeStorage()}>{children}</ThemeProvider>;
}

describe('TabsLayout', () => {
  it('registers a Home tab and a Settings tab', () => {
    const { getByText } = render(<TabsLayout />, { wrapper: Wrapper });
    getByText('Home');
    getByText('Settings');
  });

  it('gives each tab an accessible label', () => {
    const { getByLabelText } = render(<TabsLayout />, { wrapper: Wrapper });
    getByLabelText('Home tab');
    getByLabelText('Settings tab');
  });
});
