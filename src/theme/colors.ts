export interface ColorPalette {
  background: string;
  surface: string;
  surfaceVariant: string;
  border: string;
  borderSubtle: string;

  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;

  primary: string;
  primaryVariant: string;
  onPrimary: string;

  secondary: string;
  secondaryVariant: string;
  onSecondary: string;

  success: string;
  onSuccess: string;
  warning: string;
  onWarning: string;
  error: string;
  onError: string;
  info: string;
  onInfo: string;

  overlay: string;
  scrim: string;
}

// The palettes. Each theme in THEMES (themes.ts) has a light and a dark
// palette, named after the theme. Every palette must pass the WCAG AA audit
// in __tests__/contrast.test.ts, which reads every entry of THEMES.
//
// - Standard: the default look.
// - High contrast: black and white surfaces with strong colours, for users
//   who need more contrast than AA gives. Remove it if your app does not
//   want it.

export const standardLightColors: ColorPalette = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#F1F3F5',
  border: '#DEE2E6',
  borderSubtle: '#F1F3F5',

  textPrimary: '#212529',
  textSecondary: '#5C636A',
  textDisabled: '#ADB5BD',
  textInverse: '#FFFFFF',

  primary: '#4263EB',
  primaryVariant: '#3B5BDB',
  onPrimary: '#FFFFFF',

  secondary: '#7048E8',
  secondaryVariant: '#6741D9',
  onSecondary: '#FFFFFF',

  success: '#1E7E34',
  onSuccess: '#FFFFFF',
  warning: '#D9760A',
  onWarning: '#1A1200',
  error: '#C92A2A',
  onError: '#FFFFFF',
  info: '#1971C2',
  onInfo: '#FFFFFF',

  overlay: 'rgba(0, 0, 0, 0.08)',
  scrim: 'rgba(0, 0, 0, 0.5)',
};

export const standardDarkColors: ColorPalette = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceVariant: '#242424',
  border: '#3A3A3A',
  borderSubtle: '#2A2A2A',

  textPrimary: '#F1F3F5',
  textSecondary: '#ADB5BD',
  textDisabled: '#6C757D',
  textInverse: '#212529',

  primary: '#748FFC',
  primaryVariant: '#91A7FF',
  onPrimary: '#1A1A2E',

  secondary: '#9775FA',
  secondaryVariant: '#B197FC',
  onSecondary: '#1A1A2E',

  success: '#51CF66',
  onSuccess: '#0A1F0D',
  warning: '#FFD43B',
  onWarning: '#1A1200',
  error: '#FF6B6B',
  onError: '#1A0000',
  info: '#4DABF7',
  onInfo: '#001A2E',

  overlay: 'rgba(255, 255, 255, 0.08)',
  scrim: 'rgba(0, 0, 0, 0.7)',
};

export const highContrastLightColors: ColorPalette = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceVariant: '#F2F2F2',
  border: '#1A1A1A',
  borderSubtle: '#595959',

  textPrimary: '#000000',
  textSecondary: '#333333',
  textDisabled: '#767676',
  textInverse: '#FFFFFF',

  primary: '#0033CC',
  primaryVariant: '#002699',
  onPrimary: '#FFFFFF',

  secondary: '#5B0099',
  secondaryVariant: '#4A007D',
  onSecondary: '#FFFFFF',

  success: '#00661F',
  onSuccess: '#FFFFFF',
  warning: '#8A4B00',
  onWarning: '#FFFFFF',
  error: '#B00000',
  onError: '#FFFFFF',
  info: '#00507A',
  onInfo: '#FFFFFF',

  overlay: 'rgba(0, 0, 0, 0.12)',
  scrim: 'rgba(0, 0, 0, 0.7)',
};

export const highContrastDarkColors: ColorPalette = {
  background: '#000000',
  surface: '#0A0A0A',
  surfaceVariant: '#1A1A1A',
  border: '#FFFFFF',
  borderSubtle: '#A6A6A6',

  textPrimary: '#FFFFFF',
  textSecondary: '#D9D9D9',
  textDisabled: '#8C8C8C',
  textInverse: '#000000',

  primary: '#99B3FF',
  primaryVariant: '#B8CCFF',
  onPrimary: '#000000',

  secondary: '#D9B3FF',
  secondaryVariant: '#E6CCFF',
  onSecondary: '#000000',

  success: '#7CE89A',
  onSuccess: '#000000',
  warning: '#FFD54F',
  onWarning: '#000000',
  error: '#FF9C9C',
  onError: '#000000',
  info: '#8FD3FF',
  onInfo: '#000000',

  overlay: 'rgba(255, 255, 255, 0.12)',
  scrim: 'rgba(0, 0, 0, 0.8)',
};
