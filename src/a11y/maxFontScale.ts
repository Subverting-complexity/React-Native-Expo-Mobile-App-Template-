/**
 * The cap on user font scaling. Defined once here so every consumer reads the
 * same value: `AppText` and `AppTextInput` pass it as `maxFontSizeMultiplier`,
 * and the a11y context exposes it. 1.5 keeps very large Dynamic Type settings
 * from breaking layouts while still honouring a meaningful accessibility
 * increase.
 *
 * There is no global cap. React 19 ignores `defaultProps` on function
 * components, and React Native's `Text` and `TextInput` are function
 * components, so a `Text.defaultProps` patch has no effect in the app. Render
 * text through `AppText` and fields through `AppTextInput`; the lint config
 * bans a raw `Text` or `TextInput` import elsewhere.
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
