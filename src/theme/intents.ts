import type { ColorPalette } from './colors';

/** A colour meaning that a component can take: brand or status. */
export type ColorIntent =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface IntentColors {
  /** The intent's main colour: a fill, a border, or text on a plain surface. */
  base: keyof ColorPalette;
  /** The readable foreground on a `base` fill. */
  on: keyof ColorPalette;
}

/**
 * The one map from each colour intent to its palette tokens. Badges, toasts,
 * buttons, spinners, progress bars and text all read it, so a change to what
 * "warning" looks like is one edit here.
 */
export const INTENT_COLORS: Record<ColorIntent, IntentColors> = {
  primary: { base: 'primary', on: 'onPrimary' },
  secondary: { base: 'secondary', on: 'onSecondary' },
  success: { base: 'success', on: 'onSuccess' },
  warning: { base: 'warning', on: 'onWarning' },
  error: { base: 'error', on: 'onError' },
  info: { base: 'info', on: 'onInfo' },
};
