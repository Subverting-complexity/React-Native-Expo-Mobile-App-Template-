import { fireEvent, render } from '@testing-library/react-native';
import {
  SafeAreaProvider,
  type Metrics,
} from 'react-native-safe-area-context';

import GalleryRoute from '../gallery';
import { A11yProvider } from '@/a11y';
import { ToastProvider } from '@/components';
import { ThemeProvider, type StorageAdapter } from '@/theme';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn(), navigate: jest.fn() }),
}));

const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function makeStorage(): StorageAdapter {
  return {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
  };
}

function renderRoute() {
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <ThemeProvider storage={makeStorage()}>
        <A11yProvider>
          <ToastProvider>
            <GalleryRoute />
          </ToastProvider>
        </A11yProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('GalleryRoute', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it('renders the gallery', () => {
    const { getByText } = renderRoute();
    expect(getByText('Component Gallery')).toBeTruthy();
  });

  it('wires the back control to router.back', () => {
    const { getByLabelText } = renderRoute();
    fireEvent.press(getByLabelText('Back to previous screen'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
