import { StyleSheet } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AppTextInput } from '../AppTextInput';
import {
  ThemeProvider,
  a11y,
  lightColors,
  radii,
  type StorageAdapter,
} from '@/theme';

function makeStorage(saved: string | null = null): StorageAdapter {
  return {
    getItem: jest.fn(async () => saved),
    setItem: jest.fn(async () => {}),
  };
}

function renderWithTheme(ui: React.ReactElement, saved: string | null = null) {
  return render(
    <ThemeProvider storage={makeStorage(saved)}>{ui}</ThemeProvider>,
  );
}

describe('AppTextInput', () => {
  it('renders the visible label', () => {
    const { getByText } = renderWithTheme(<AppTextInput label="Email" />);
    expect(getByText('Email')).toBeTruthy();
  });

  it('names the field with the label for screen readers by default', () => {
    const { getByLabelText } = renderWithTheme(<AppTextInput label="Email" />);
    expect(getByLabelText('Email')).toBeTruthy();
  });

  it('lets accessibilityLabel override the spoken name', () => {
    const { getByLabelText } = renderWithTheme(
      <AppTextInput label="Email" accessibilityLabel="Work email address" />,
    );
    expect(getByLabelText('Work email address')).toBeTruthy();
  });

  it('shows the hint as helper text and as the field hint', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <AppTextInput label="Email" hint="We never share it" testID="field" />,
    );
    expect(getByText('We never share it')).toBeTruthy();
    expect(getByTestId('field').props.accessibilityHint).toBe(
      'We never share it',
    );
  });

  it('renders the error message and prefers it over the hint', () => {
    const { getByText, queryByText, getByTestId } = renderWithTheme(
      <AppTextInput
        label="Email"
        hint="We never share it"
        errorText="Email is required"
        testID="field"
      />,
    );
    expect(getByText('Email is required')).toBeTruthy();
    expect(queryByText('We never share it')).toBeNull();
    expect(getByTestId('field').props.accessibilityHint).toBe(
      'Email is required',
    );
  });

  it('applies the error border colour when in the error state', async () => {
    const { getByTestId } = renderWithTheme(
      <AppTextInput label="Email" errorText="Required" testID="field" />,
      'light',
    );
    await waitFor(() => {
      const flat = StyleSheet.flatten(getByTestId('field').props.style);
      expect(flat.borderColor).toBe(lightColors.error);
    });
  });

  it('highlights the border with the primary colour on focus', async () => {
    const { getByTestId } = renderWithTheme(
      <AppTextInput label="Email" testID="field" />,
      'light',
    );
    fireEvent(getByTestId('field'), 'focus');
    await waitFor(() => {
      const flat = StyleSheet.flatten(getByTestId('field').props.style);
      expect(flat.borderColor).toBe(lightColors.primary);
    });
  });

  it('marks the field disabled when not editable', () => {
    const { getByTestId } = renderWithTheme(
      <AppTextInput label="Email" editable={false} testID="field" />,
    );
    expect(getByTestId('field').props.accessibilityState.disabled).toBe(true);
  });

  it('applies the token radius and the 44px minimum height', () => {
    const { getByTestId } = renderWithTheme(
      <AppTextInput label="Email" testID="field" />,
    );
    const flat = StyleSheet.flatten(getByTestId('field').props.style);
    expect(flat.borderRadius).toBe(radii.md);
    expect(flat.minHeight).toBe(a11y.minTouchTarget);
  });
});
