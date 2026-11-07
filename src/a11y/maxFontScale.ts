import { Text, TextInput } from 'react-native';

/**
 * Global cap on user font scaling. Defined once here so every consumer
 * (the global cap below, the a11y context, future `AppText`) reads the same
 * value. 1.5 keeps very large Dynamic Type settings from breaking layouts
 * while still honouring a meaningful accessibility increase.
 */
export const MAX_FONT_SIZE_MULTIPLIER = 1.5;

/**
 * The factor React Native applies to `fontSize`: the OS font scale, capped by
 * `maxFontSizeMultiplier` (`null` or `undefined` removes the cap), or 1 when
 * font scaling is off. React Native does not scale `lineHeight`, so text
 * components multiply their line height by this factor to stop large text
 * from clipping.
 */
export function fontScaleFactor(
  fontScale: number,
  allowFontScaling: boolean,
  maxFontSizeMultiplier: number | null | undefined,
): number {
  if (!allowFontScaling) {
    return 1;
  }
  return maxFontSizeMultiplier == null
    ? fontScale
    : Math.min(fontScale, maxFontSizeMultiplier);
}

interface CappableComponent {
  defaultProps?: { maxFontSizeMultiplier?: number | null } & Record<
    string,
    unknown
  >;
}

function applyTo(component: CappableComponent): void {
  // defaultProps fills the value only when an instance leaves it undefined,
  // so a per-instance `maxFontSizeMultiplier` (including `null` to opt out)
  // always wins. This is React Native's standard global font-cap mechanism.
  component.defaultProps = {
    ...component.defaultProps,
    maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER,
  };
}

let applied = false;

/**
 * Installs the global font-scale cap on `Text` and `TextInput`. Idempotent —
 * safe to call from module load and from tests.
 */
export function applyGlobalFontScaleCap(): void {
  if (applied) {
    return;
  }
  applied = true;
  applyTo(Text as unknown as CappableComponent);
  applyTo(TextInput as unknown as CappableComponent);
}
