/**
 * WCAG 2.1 contrast utilities.
 *
 * Pure functions for computing the contrast ratio between two colors, plus
 * the AA thresholds. These power the palette contrast test (so token edits
 * that break accessibility fail CI) and are exported for components that need
 * to make contrast-aware decisions at runtime.
 *
 * Reference: https://www.w3.org/TR/WCAG21/#contrast-minimum (1.4.3) and
 * https://www.w3.org/TR/WCAG21/#non-text-contrast (1.4.11).
 */

/** Minimum contrast ratio for normal body text (WCAG 1.4.3 AA). */
export const AA_NORMAL_TEXT = 4.5;

/**
 * Minimum contrast ratio for large text (>=18pt, or >=14pt bold) and for
 * the visual boundaries of UI components and graphical objects
 * (WCAG 1.4.3 large text + 1.4.11 non-text contrast).
 */
export const AA_LARGE_TEXT = 3;

/** Alias: non-text UI elements (icons, focus rings, meaningful borders). */
export const AA_NON_TEXT = AA_LARGE_TEXT;

/**
 * Parse a `#RGB` or `#RRGGBB` hex string into 0-255 channel values.
 * Throws on any other input so a malformed token is caught immediately
 * rather than silently producing a wrong ratio.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.trim().replace(/^#/, '');

  const expanded =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;

  if (expanded.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(expanded)) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }

  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
}

/** Linearize a single 0-255 sRGB channel (WCAG relative-luminance step). */
function linearizeChannel(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Relative luminance of a color per WCAG 2.1, in the range 0 (black) to
 * 1 (white).
 */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * linearizeChannel(r) +
    0.7152 * linearizeChannel(g) +
    0.0722 * linearizeChannel(b)
  );
}

/**
 * Contrast ratio between two colors per WCAG 2.1, in the range 1 (no
 * contrast) to 21 (black on white). Order-independent.
 */
export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** True when the pair meets the given AA threshold (default: normal text). */
export function meetsAA(
  foreground: string,
  background: string,
  threshold: number = AA_NORMAL_TEXT,
): boolean {
  return contrastRatio(foreground, background) >= threshold;
}
