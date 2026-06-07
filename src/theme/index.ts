import type { ColorPalette } from './colors';
import { lightColors, darkColors } from './colors';
import { spacing } from './spacing';
import { radii } from './radii';
import { typography } from './typography';
import { shadows } from './shadows';
import { zIndex } from './zIndex';

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

export { lightColors, darkColors } from './colors';
export { spacing } from './spacing';
export { radii } from './radii';
export { typography } from './typography';
export { shadows, iosShadows, androidShadows, webShadows } from './shadows';
export { zIndex } from './zIndex';

export type { ColorMode, StorageAdapter, ThemeContextValue } from './ThemeContext';
export { ThemeProvider } from './ThemeProvider';
export { useTheme } from './useTheme';

export interface ThemeTokens {
  colors: ColorPalette;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
  zIndex: typeof zIndex;
}

function buildTheme(colors: ColorPalette): ThemeTokens {
  return { colors, spacing, radii, typography, shadows, zIndex };
}

export const lightTheme: ThemeTokens = buildTheme(lightColors);
export const darkTheme: ThemeTokens = buildTheme(darkColors);
