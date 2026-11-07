import type { ColorPalette } from './colors';
import {
  highContrastDarkColors,
  highContrastLightColors,
  standardDarkColors,
  standardLightColors,
} from './colors';
import { spacing } from './spacing';
import { radii } from './radii';
import { typography } from './typography';
import { shadows } from './shadows';
import { zIndex } from './zIndex';
import { a11y } from './a11y';
import { opacity } from './opacity';
import { borderWidths } from './borderWidths';
import { iconSizes } from './iconSizes';

export interface ThemeTokens {
  colors: ColorPalette;
  spacing: typeof spacing;
  radii: typeof radii;
  borderWidths: typeof borderWidths;
  iconSizes: typeof iconSizes;
  typography: typeof typography;
  shadows: typeof shadows;
  opacity: typeof opacity;
  zIndex: typeof zIndex;
  a11y: typeof a11y;
}

function buildTheme(colors: ColorPalette): ThemeTokens {
  return {
    colors,
    spacing,
    radii,
    borderWidths,
    iconSizes,
    typography,
    shadows,
    opacity,
    zIndex,
    a11y,
  };
}

/** One theme: the name the user sees, and its light and dark version. */
export interface ThemeDefinition {
  label: string;
  light: ThemeTokens;
  dark: ThemeTokens;
}

/**
 * The only list of themes, in the order Settings shows them. A new entry here
 * reaches Settings, persistence and the contrast audit. Settings hides the
 * theme choice when this list has only one entry.
 */
export const THEMES = {
  standard: {
    label: 'Standard',
    light: buildTheme(standardLightColors),
    dark: buildTheme(standardDarkColors),
  },
  highContrast: {
    label: 'High contrast',
    light: buildTheme(highContrastLightColors),
    dark: buildTheme(highContrastDarkColors),
  },
} satisfies Record<string, ThemeDefinition>;

export type ThemeName = keyof typeof THEMES;

export const THEME_NAMES = Object.keys(THEMES) as ThemeName[];

/** The theme a new install starts on. */
export const DEFAULT_THEME_NAME: ThemeName = 'standard';

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && (THEME_NAMES as string[]).includes(value);
}
