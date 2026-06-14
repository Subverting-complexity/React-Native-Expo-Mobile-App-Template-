import { AccessibilityInfo } from 'react-native';
import { render } from '@testing-library/react-native';
import RootLayout from '../_layout';

jest.mock('expo-router', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { Stack: () => React.createElement(View, { testID: 'stack' }) };
});

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));

jest.mock('../../src/hooks/useAppFonts', () => ({
  useAppFonts: jest.fn(),
}));

const mockUseAppFonts = jest.requireMock<{ useAppFonts: jest.Mock }>(
  '../../src/hooks/useAppFonts',
).useAppFonts;

describe('RootLayout', () => {
  beforeEach(() => {
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(false);
    jest
      .spyOn(AccessibilityInfo, 'addEventListener')
      .mockReturnValue({ remove: jest.fn() } as ReturnType<
        typeof AccessibilityInfo.addEventListener
      >);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders nothing while fonts are loading', () => {
    mockUseAppFonts.mockReturnValue([false, null]);
    const { toJSON } = render(<RootLayout />);
    expect(toJSON()).toBeNull();
  });

  it('renders the stack once fonts have loaded', () => {
    mockUseAppFonts.mockReturnValue([true, null]);
    const { getByTestId } = render(<RootLayout />);
    expect(getByTestId('stack')).toBeTruthy();
  });

  it('renders the stack when font loading fails (graceful degradation)', () => {
    mockUseAppFonts.mockReturnValue([false, new Error('Font load failed')]);
    const { getByTestId } = render(<RootLayout />);
    expect(getByTestId('stack')).toBeTruthy();
  });
});
