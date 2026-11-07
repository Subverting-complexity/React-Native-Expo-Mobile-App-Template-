export type { ColorPalette } from './colors';
export type { SpacingScale } from './spacing';
export type { RadiiScale } from './radii';
export type {
  TypographyTokens,
  FontWeight,
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
export type { OpacityScale } from './opacity';
export type { BorderWidthScale } from './borderWidths';
export type { IconSizeScale } from './iconSizes';
export type { ColorIntent, IntentColors } from './intents';

export { spacing } from './spacing';
export { radii } from './radii';
export { opacity } from './opacity';
export { borderWidths } from './borderWidths';
export { iconSizes } from './iconSizes';
export { INTENT_COLORS } from './intents';
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
export { buildPreHydrationBackgroundCss } from './preHydrationTheme';
export { withAlpha } from './withAlpha';

export type { ColorMode, ThemeContextValue } from './ThemeContext';
export { COLOR_MODES, COLOR_MODE_LABELS, isColorMode } from './ThemeContext';
// Exported so consumers that must tolerate a missing provider (e.g. an error
// boundary fallback rendered above ThemeProvider) can read the context
// directly with useContext instead of useTheme, which throws when absent.
export { ThemeContext } from './ThemeContext';
export { ThemeProvider } from './ThemeProvider';
export { useTheme } from './useTheme';

// Theme assembly (token bundles → ThemeTokens) lives in its own module so the
// barrel only re-exports. ThemeProvider/ThemeContext import these from
// './themes' directly, avoiding a barrel-import cycle.
export type { ThemeTokens, ThemeName, ThemeDefinition } from './themes';
export { THEMES, THEME_NAMES, DEFAULT_THEME_NAME, isThemeName } from './themes';
