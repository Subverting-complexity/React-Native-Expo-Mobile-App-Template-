import { Platform } from 'react-native';

export interface IosShadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
}

export interface AndroidShadow {
  elevation: number;
}

export interface WebShadow {
  boxShadow: string;
}

export type ShadowToken = IosShadow | AndroidShadow | WebShadow;

function iosShadow(
  height: number,
  radius: number,
  opacity: number,
): IosShadow {
  return {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
}

function androidShadow(elevation: number): AndroidShadow {
  return { elevation };
}

function webShadow(value: string): WebShadow {
  return { boxShadow: value };
}

export type ShadowLevel = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ShadowScale = Record<ShadowLevel, ShadowToken>;

const iosShadows: ShadowScale = {
  none: iosShadow(0, 0, 0),
  xs: iosShadow(1, 2, 0.06),
  sm: iosShadow(2, 4, 0.08),
  md: iosShadow(4, 8, 0.1),
  lg: iosShadow(8, 16, 0.12),
  xl: iosShadow(16, 24, 0.16),
};

const androidShadows: ShadowScale = {
  none: androidShadow(0),
  xs: androidShadow(1),
  sm: androidShadow(2),
  md: androidShadow(4),
  lg: androidShadow(8),
  xl: androidShadow(16),
};

const webShadows: ShadowScale = {
  none: webShadow('none'),
  xs: webShadow('0 1px 2px rgba(0,0,0,0.06)'),
  sm: webShadow('0 2px 4px rgba(0,0,0,0.08)'),
  md: webShadow('0 4px 8px rgba(0,0,0,0.10)'),
  lg: webShadow('0 8px 16px rgba(0,0,0,0.12)'),
  xl: webShadow('0 16px 24px rgba(0,0,0,0.16)'),
};

export const shadows: ShadowScale =
  Platform.OS === 'ios'
    ? iosShadows
    : Platform.OS === 'android'
      ? androidShadows
      : webShadows;

export { iosShadows, androidShadows, webShadows };
