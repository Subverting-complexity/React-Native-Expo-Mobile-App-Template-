import { fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import HomeScreen from '../../../app/(tabs)/index';
import { ThemeProvider } from '@/theme';
import { makeStorage, renderHydrated } from '../../../src/test';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), navigate: jest.fn() }),
}));

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

describe('HomeScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', async () => {
    await renderHydrated(<HomeScreen />, { wrapper: Wrapper });
  });

  it('displays the template label', async () => {
    const { getByText } = await renderHydrated(<HomeScreen />, {
      wrapper: Wrapper,
    });
    getByText('Expo Template');
  });

  it('navigates to the gallery when the button is pressed', async () => {
    const { getByLabelText } = await renderHydrated(<HomeScreen />, {
      wrapper: Wrapper,
    });
    fireEvent.press(getByLabelText('Open component gallery'));
    expect(mockPush).toHaveBeenCalledWith('/gallery');
  });
});
