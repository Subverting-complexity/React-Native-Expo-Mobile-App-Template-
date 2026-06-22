import { fireEvent, render } from '@testing-library/react-native';
import {
  SafeAreaProvider,
  type Metrics,
} from 'react-native-safe-area-context';

import { ComponentGallery } from '../ComponentGallery';
import { A11yProvider } from '@/a11y';
import { ToastProvider } from '@/components';
import { ThemeProvider } from '@/theme';
import { makeStorage } from '@/test';

const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderGallery(onBack?: () => void) {
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <ThemeProvider storage={makeStorage()}>
        <A11yProvider>
          <ToastProvider>
            <ComponentGallery onBack={onBack} />
          </ToastProvider>
        </A11yProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('ComponentGallery', () => {
  it('renders the heading and every section', () => {
    const { getByText } = renderGallery();
    getByText('Component Gallery');
    for (const section of [
      'Typography',
      'Actions',
      'Selection',
      'Forms',
      'Surfaces',
      'Feedback',
      'System',
    ]) {
      expect(getByText(section)).toBeTruthy();
    }
  });

  it('renders a back control only when onBack is provided', () => {
    const withoutBack = renderGallery();
    expect(withoutBack.queryByLabelText('Back to previous screen')).toBeNull();

    const onBack = jest.fn();
    const { getByLabelText } = renderGallery(onBack);
    fireEvent.press(getByLabelText('Back to previous screen'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('toggles the standalone chip selection', () => {
    const { getByLabelText, getByText, queryByText } = renderGallery();
    expect(getByText('Pin')).toBeTruthy();
    fireEvent.press(getByLabelText('Toggle pinned'));
    expect(getByText('Pinned')).toBeTruthy();
    expect(queryByText('Pin')).toBeNull();
  });

  it('shows a validation error when the email is malformed', () => {
    const { getByLabelText, getByText, queryByText } = renderGallery();
    expect(queryByText('Enter a valid email address.')).toBeNull();
    fireEvent.changeText(getByLabelText('Email'), 'not-an-email');
    expect(getByText('Enter a valid email address.')).toBeTruthy();
  });

  it('advances the progress bar when "More" is pressed', () => {
    const { getByLabelText, getByText } = renderGallery();
    expect(getByText('Progress (40%)')).toBeTruthy();
    fireEvent.press(getByLabelText('More'));
    expect(getByText('Progress (60%)')).toBeTruthy();
  });

  it('raises a toast through the provider', () => {
    const { getByLabelText, getByText, queryByText } = renderGallery();
    expect(queryByText('Item archived')).toBeNull();
    fireEvent.press(getByLabelText('with action'));
    expect(getByText('Item archived')).toBeTruthy();
  });

  it('catches a thrown error in the boundary and resets it', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const { getByLabelText, getByText } = renderGallery();
      expect(getByText('Component is healthy. Press “Break it” to throw.')).toBeTruthy();

      fireEvent.press(getByLabelText('Break it'));
      expect(getByText('Caught: Demo error from the gallery.')).toBeTruthy();

      fireEvent.press(getByLabelText('Reset'));
      expect(getByText('Component is healthy. Press “Break it” to throw.')).toBeTruthy();
    } finally {
      spy.mockRestore();
    }
  });
});
