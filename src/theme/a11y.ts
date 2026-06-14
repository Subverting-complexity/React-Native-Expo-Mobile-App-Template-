/**
 * Accessibility design tokens.
 *
 * Static, color-mode-independent values that encode accessibility
 * minimums. Components read these via `useTheme()` rather than hardcoding
 * the numbers, so the floor is defined once and re-skinning never weakens
 * it. Runtime accessibility *state* (reduce-motion, font scaling) is a
 * separate concern handled by the a11y context stories.
 */
export interface A11yTokens {
  /**
   * Minimum touch-target size in points for any interactive element.
   * 44 is the WCAG 2.5.5 (AAA) / Apple HIG minimum and the Android
   * Material 48dp recommendation's lower bound.
   */
  minTouchTarget: number;
}

export const a11y: A11yTokens = {
  minTouchTarget: 44,
};
