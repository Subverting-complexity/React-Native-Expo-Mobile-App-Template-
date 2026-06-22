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

export const lightColors: ColorPalette = {
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

export const darkColors: ColorPalette = {
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
