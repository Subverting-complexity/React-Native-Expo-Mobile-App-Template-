import { renderHook } from '@testing-library/react-native';

import { useAppFonts } from '../useAppFonts';
import { FONT_FAMILIES } from '@/theme';

jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
}));

const mockUseFonts = jest.requireMock<{ useFonts: jest.Mock }>(
  'expo-font',
).useFonts;

describe('useAppFonts', () => {
  it('loads one font file for each family the theme names', () => {
    renderHook(() => useAppFonts());
    const loaded = Object.keys(mockUseFonts.mock.calls[0][0]);
    expect(loaded.sort()).toEqual(Object.values(FONT_FAMILIES).sort());
  });
});
