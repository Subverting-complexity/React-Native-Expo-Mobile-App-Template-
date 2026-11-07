import { fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import GalleryRoute from '../../app/gallery';
import { A11yProvider } from '@/a11y';
import { ToastProvider } from '@/components';
import { ThemeProvider } from '@/theme';
import { makeStorage, renderHydrated } from '../../src/test';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn(), navigate: jest.fn() }),
}));

const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderRoute() {
  return renderHydrated(
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

  it('renders the gallery', async () => {
    const { getByText } = await renderRoute();
    expect(getByText('Component Gallery')).toBeTruthy();
  });

  it('wires the back control to router.back', async () => {
    const { getByLabelText } = await renderRoute();
    fireEvent.press(getByLabelText('Back to previous screen'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
