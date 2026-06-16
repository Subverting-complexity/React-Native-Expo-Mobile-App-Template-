import { render } from '@testing-library/react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import SettingsScreen from '../settings';
import { ThemeProvider, type StorageAdapter } from '@/theme';

const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const storage: StorageAdapter = {
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>
      <ThemeProvider storage={storage}>{children}</ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('SettingsScreen', () => {
  it('renders without crashing', () => {
    render(<SettingsScreen />, { wrapper: Wrapper });
  });

  it('displays the Settings heading', () => {
    const { getByText } = render(<SettingsScreen />, { wrapper: Wrapper });
    getByText('Settings');
  });
});
