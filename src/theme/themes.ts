import type { ColorPalette } from './colors';
import { lightColors, darkColors } from './colors';
import { spacing } from './spacing';
import { radii } from './radii';
import { typography } from './typography';
import { shadows } from './shadows';
import { zIndex } from './zIndex';
import { a11y } from './a11y';

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
