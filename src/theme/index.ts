import type { ColorPalette } from './colors';
import { lightColors, darkColors } from './colors';
import { spacing } from './spacing';
import { radii } from './radii';
import { typography } from './typography';
import { shadows } from './shadows';
import { zIndex } from './zIndex';
import { a11y } from './a11y';

export type { ColorPalette } from './colors';
export type { SpacingScale } from './spacing';
export type { RadiiScale } from './radii';
export type {
  TypographyTokens,
  FontWeight,
  FontWeights,
  TextVariant,
  TextScale,
  FontFamilies,
  FontFamily,
  FontFamilyValue,
  TextVariantName,
  TextVariantStyle,
  TextVariants,
} from './typography';
export type {
  ShadowScale,
  ShadowToken,
  ShadowLevel,
  IosShadow,
  AndroidShadow,
  WebShadow,
} from './shadows';
export type { ZIndexScale } from './zIndex';
export type { A11yTokens } from './a11y';

export { lightColors, darkColors } from './colors';
export { spacing } from './spacing';
export { radii } from './radii';
export { typography, FONT_FAMILIES } from './typography';
export { shadows, iosShadows, androidShadows, webShadows } from './shadows';
export { zIndex } from './zIndex';
export { a11y } from './a11y';
export {
  AA_NORMAL_TEXT,
  AA_LARGE_TEXT,
  AA_NON_TEXT,
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  meetsAA,
} from './contrast';

export type {
  ColorMode,
  StorageAdapter,
  ThemeContextValue,
} from './ThemeContext';
// Exported so consumers that must tolerate a missing provider (e.g. an error
// boundary fallback rendered above ThemeProvider) can read the context
// directly with useContext instead of useTheme, which throws when absent.
export { ThemeContext } from './ThemeContext';
export { ThemeProvider } from './ThemeProvider';
export { useTheme } from './useTheme';

export interface ThemeTokens {
  colors: ColorPalette;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
  zIndex: typeof zIndex;
  a11y: typeof a11y;
}

function buildTheme(colors: ColorPalette): ThemeTokens {
  return { colors, spacing, radii, typography, shadows, zIndex, a11y };
}

export const lightTheme: ThemeTokens = buildTheme(lightColors);
export const darkTheme: ThemeTokens = buildTheme(darkColors);
