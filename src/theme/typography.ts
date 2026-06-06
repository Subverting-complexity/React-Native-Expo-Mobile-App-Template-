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
  /** System sans-serif — replaced by Atkinson Hyperlegible once bundled (#18). */
  sans: string;
  /** System monospace. */
  mono: string;
}

export interface TypographyTokens {
  families: FontFamilies;
  weights: FontWeights;
  sizes: TextScale;
}

export const typography: TypographyTokens = {
  families: {
    sans: 'System',
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
};
