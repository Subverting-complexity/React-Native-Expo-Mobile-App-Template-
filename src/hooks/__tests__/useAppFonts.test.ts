import { renderHook } from '@testing-library/react-native';
import { useAppFonts } from '../useAppFonts';

jest.mock('expo-font', () => ({
  useFonts: jest.fn(),
}));

jest.mock('@expo-google-fonts/atkinson-hyperlegible', () => ({
  AtkinsonHyperlegible_400Regular: 'mock-regular',
  AtkinsonHyperlegible_400Regular_Italic: 'mock-italic',
  AtkinsonHyperlegible_700Bold: 'mock-bold',
  AtkinsonHyperlegible_700Bold_Italic: 'mock-bold-italic',
}));

const mockUseFonts = jest.requireMock<{ useFonts: jest.Mock }>(
  'expo-font',
).useFonts;

describe('useAppFonts', () => {
  it('returns [false, null] while fonts are loading', () => {
    mockUseFonts.mockReturnValue([false, null]);
    const { result } = renderHook(() => useAppFonts());
    expect(result.current[0]).toBe(false);
    expect(result.current[1]).toBeNull();
  });

  it('returns [true, null] when fonts have loaded', () => {
    mockUseFonts.mockReturnValue([true, null]);
    const { result } = renderHook(() => useAppFonts());
    expect(result.current[0]).toBe(true);
    expect(result.current[1]).toBeNull();
  });

  it('returns [false, error] when font loading fails', () => {
    const loadError = new Error('Font load failed');
    mockUseFonts.mockReturnValue([false, loadError]);
    const { result } = renderHook(() => useAppFonts());
    expect(result.current[0]).toBe(false);
    expect(result.current[1]).toBe(loadError);
  });

  it('passes all four Atkinson Hyperlegible variants to useFonts', () => {
    mockUseFonts.mockReturnValue([true, null]);
    renderHook(() => useAppFonts());
    expect(mockUseFonts).toHaveBeenCalledWith({
      AtkinsonHyperlegible_400Regular: 'mock-regular',
      AtkinsonHyperlegible_400Regular_Italic: 'mock-italic',
      AtkinsonHyperlegible_700Bold: 'mock-bold',
      AtkinsonHyperlegible_700Bold_Italic: 'mock-bold-italic',
    });
  });
});
