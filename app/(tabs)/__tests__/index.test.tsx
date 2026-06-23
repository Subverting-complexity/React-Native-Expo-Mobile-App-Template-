import { fireEvent, render } from '@testing-library/react-native';
import {
  SafeAreaProvider,
  type Metrics,
} from 'react-native-safe-area-context';

import HomeScreen from '../index';
import { ThemeProvider } from '@/theme';
import { makeStorage } from '../../../src/test';

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

  it('renders without crashing', () => {
    render(<HomeScreen />, { wrapper: Wrapper });
  });

  it('displays the template label', () => {
    const { getByText } = render(<HomeScreen />, { wrapper: Wrapper });
    getByText('Expo Template');
  });

  it('navigates to the gallery when the button is pressed', () => {
    const { getByLabelText } = render(<HomeScreen />, { wrapper: Wrapper });
    fireEvent.press(getByLabelText('Open component gallery'));
    expect(mockPush).toHaveBeenCalledWith('/gallery');
  });
});
