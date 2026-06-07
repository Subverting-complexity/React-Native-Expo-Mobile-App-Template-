import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_400Regular_Italic,
  AtkinsonHyperlegible_700Bold,
  AtkinsonHyperlegible_700Bold_Italic,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { useFonts } from 'expo-font';

/**
 * Loads all app fonts. Returns [loaded, error] matching the expo-font
 * useFonts contract. Use this in the root layout to gate rendering until
 * Atkinson Hyperlegible is available on all platforms.
 */
export function useAppFonts(): [boolean, Error | null] {
  return useFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_400Regular_Italic,
    AtkinsonHyperlegible_700Bold,
    AtkinsonHyperlegible_700Bold_Italic,
  });
}
