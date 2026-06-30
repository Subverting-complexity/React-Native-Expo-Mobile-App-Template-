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

export type ShadowLevel = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ShadowScale = Record<ShadowLevel, ShadowToken>;

/**
 * Single source of truth for the shadow scale. Each level is described once —
 * vertical offset, blur radius, and opacity (plus the Android `elevation`,
 * which the platform renders independently of offset/blur). The iOS, Android,
 * and web token sets are all derived from these specs, so re-skinning a shadow
 * is a one-row edit here, not three platform-specific values kept in sync by
 * hand.
 */
interface ShadowSpec {
  /** Vertical offset (iOS) and the offset half of the web box-shadow, in px. */
  height: number;
  /** Blur radius, in px. */
  blur: number;
  /** Shadow opacity (0–1), applied to black. */
  opacity: number;
  /** Android elevation, rendered without an explicit offset/blur. */
  elevation: number;
}

const SHADOW_SPECS: Record<ShadowLevel, ShadowSpec> = {
  none: { height: 0, blur: 0, opacity: 0, elevation: 0 },
  xs: { height: 1, blur: 2, opacity: 0.06, elevation: 1 },
  sm: { height: 2, blur: 4, opacity: 0.08, elevation: 2 },
  md: { height: 4, blur: 8, opacity: 0.1, elevation: 4 },
  lg: { height: 8, blur: 16, opacity: 0.12, elevation: 8 },
  xl: { height: 16, blur: 24, opacity: 0.16, elevation: 16 },
};

function iosShadow(spec: ShadowSpec): IosShadow {
  return {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: spec.height },
    shadowOpacity: spec.opacity,
    shadowRadius: spec.blur,
  };
}

function androidShadow(spec: ShadowSpec): AndroidShadow {
  return { elevation: spec.elevation };
}

function webShadow(spec: ShadowSpec): WebShadow {
  if (spec.opacity === 0) {
    return { boxShadow: 'none' };
  }
  return {
    boxShadow: `0 ${spec.height}px ${spec.blur}px rgba(0,0,0,${spec.opacity})`,
  };
}

function deriveShadows<T extends ShadowToken>(
  build: (spec: ShadowSpec) => T,
): Record<ShadowLevel, T> {
  const levels = Object.keys(SHADOW_SPECS) as ShadowLevel[];
  return Object.fromEntries(
    levels.map((level) => [level, build(SHADOW_SPECS[level])]),
  ) as Record<ShadowLevel, T>;
}

const iosShadows: ShadowScale = deriveShadows(iosShadow);
const androidShadows: ShadowScale = deriveShadows(androidShadow);
const webShadows: ShadowScale = deriveShadows(webShadow);

export const shadows: ShadowScale =
  Platform.OS === 'ios'
    ? iosShadows
    : Platform.OS === 'android'
      ? androidShadows
      : webShadows;

export { iosShadows, androidShadows, webShadows };
