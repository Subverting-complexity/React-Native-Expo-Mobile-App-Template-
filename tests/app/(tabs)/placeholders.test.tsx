import { render } from '@testing-library/react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import ExploreScreen from '../../../app/(tabs)/explore';
import { ThemeProvider } from '@/theme';
import { makeStorage } from '../../../src/test';

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

describe.each([['Explore', ExploreScreen, 'explore-screen']])(
  '%s placeholder',
  (title, Screen, testID) => {
    // The find* query waits for the icon font, which loads after the first render.
    it('renders its title', async () => {
      const { findByTestId, getByText } = render(<Screen />, {
        wrapper: Wrapper,
      });
      await findByTestId(testID);
      getByText(title);
    });
  },
);
