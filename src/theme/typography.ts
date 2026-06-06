/**
 * Font family tokens for the app.
 *
 * Keys match the font-family strings loaded by useAppFonts. Components
 * read these tokens rather than referencing the raw expo-google-fonts
 * identifiers directly — re-skinning is a token edit, not a component edit.
 */
export const FONT_FAMILIES = {
  /** Atkinson Hyperlegible — regular weight, upright */
  sans: 'AtkinsonHyperlegible_400Regular',
  /** Atkinson Hyperlegible — bold weight, upright */
  sansBold: 'AtkinsonHyperlegible_700Bold',
  /** Atkinson Hyperlegible — regular weight, italic */
  sansItalic: 'AtkinsonHyperlegible_400Regular_Italic',
  /** Atkinson Hyperlegible — bold weight, italic */
  sansBoldItalic: 'AtkinsonHyperlegible_700Bold_Italic',
} as const;

export type FontFamily = keyof typeof FONT_FAMILIES;
export type FontFamilyValue = (typeof FONT_FAMILIES)[FontFamily];
