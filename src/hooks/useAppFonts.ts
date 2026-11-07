import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_400Regular_Italic,
  AtkinsonHyperlegible_700Bold,
  AtkinsonHyperlegible_700Bold_Italic,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { useFonts, type FontSource } from 'expo-font';

import { FONT_FAMILIES, type FontFamilyValue } from '@/theme';

/** One font file for each family in `FONT_FAMILIES`; the compiler flags a missing one. */
const FONT_FILES: Record<FontFamilyValue, FontSource> = {
  [FONT_FAMILIES.sans]: AtkinsonHyperlegible_400Regular,
  [FONT_FAMILIES.sansBold]: AtkinsonHyperlegible_700Bold,
  [FONT_FAMILIES.sansItalic]: AtkinsonHyperlegible_400Regular_Italic,
  [FONT_FAMILIES.sansBoldItalic]: AtkinsonHyperlegible_700Bold_Italic,
};

/**
 * Loads all app fonts. Returns [loaded, error] matching the expo-font
 * useFonts contract. Use this in the root layout to gate rendering until
 * every family in `FONT_FAMILIES` is available on all platforms.
 */
export function useAppFonts(): [boolean, Error | null] {
  return useFonts(FONT_FILES);
}
