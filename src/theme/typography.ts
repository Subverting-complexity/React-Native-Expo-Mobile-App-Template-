export type FontWeight =
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export interface FontWeights {
  thin: FontWeight;
  light: FontWeight;
  regular: FontWeight;
  medium: FontWeight;
  semibold: FontWeight;
  bold: FontWeight;
  extrabold: FontWeight;
}

export interface TextVariant {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface TextScale {
  xs: TextVariant;
  sm: TextVariant;
  md: TextVariant;
  lg: TextVariant;
  xl: TextVariant;
  '2xl': TextVariant;
  '3xl': TextVariant;
  '4xl': TextVariant;
}

export interface FontFamilies {
  sans: string;
  mono: string;
}

/**
 * Semantic text roles. Components reference a role (`body`, `heading`, …)
 * rather than raw size/weight numbers, so re-skinning the type system is a
 * single token edit. Each role resolves to a size from {@link TextScale}, a
 * loaded font `family`, and the matching `weight`.
 */
export type TextVariantName =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'caption';

export interface TextVariantStyle {
  /** Key into {@link TextScale} for fontSize / lineHeight / letterSpacing. */
  size: keyof TextScale;
  /** A loaded font-family string (see {@link FONT_FAMILIES}). */
  family: string;
  /** Numeric weight matching the chosen family. */
  weight: FontWeight;
}

export type TextVariants = Record<TextVariantName, TextVariantStyle>;

export interface TypographyTokens {
  families: FontFamilies;
  weights: FontWeights;
  sizes: TextScale;
  variants: TextVariants;
}

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

export const typography: TypographyTokens = {
  families: {
    sans: FONT_FAMILIES.sans,
    mono: 'Courier New',
  },
  weights: {
    thin: '100',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  sizes: {
    xs: { fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
    sm: { fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
    md: { fontSize: 16, lineHeight: 24, letterSpacing: 0 },
    lg: { fontSize: 18, lineHeight: 28, letterSpacing: -0.25 },
    xl: { fontSize: 20, lineHeight: 28, letterSpacing: -0.25 },
    '2xl': { fontSize: 24, lineHeight: 32, letterSpacing: -0.5 },
    '3xl': { fontSize: 30, lineHeight: 36, letterSpacing: -0.75 },
    '4xl': { fontSize: 36, lineHeight: 40, letterSpacing: -1 },
  },
  // Only the regular (400) and bold (700) Atkinson Hyperlegible weights are
  // bundled, so heavier roles map to the bold family rather than an
  // intermediate fontWeight that no font file backs.
  variants: {
    display: { size: '4xl', family: FONT_FAMILIES.sansBold, weight: '700' },
    title: { size: '3xl', family: FONT_FAMILIES.sansBold, weight: '700' },
    heading: { size: '2xl', family: FONT_FAMILIES.sansBold, weight: '700' },
    subheading: { size: 'xl', family: FONT_FAMILIES.sansBold, weight: '700' },
    body: { size: 'md', family: FONT_FAMILIES.sans, weight: '400' },
    bodySmall: { size: 'sm', family: FONT_FAMILIES.sans, weight: '400' },
    label: { size: 'sm', family: FONT_FAMILIES.sansBold, weight: '700' },
    caption: { size: 'xs', family: FONT_FAMILIES.sans, weight: '400' },
  },
};
