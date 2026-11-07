// Builds the CSS injected into the web document head before React hydrates.
//
// On web, Expo Router renders a static HTML shell first; React then hydrates
// it. Without an explicit background color the browser paints its default
// (usually white) for a frame before the themed UI mounts, producing a visible
// flash. Setting the background in the pre-hydration <style> removes it.
//
// The CSS defaults to the dark background; a browser that prefers a light
// scheme gets the light background via a `prefers-color-scheme` media query.
// (The provider itself defaults to the 'system' mode.) Values
// come from the color tokens — never hardcode them here.
// It covers the default theme only: a saved theme or mode applies after hydration.

import type { ColorPalette } from './colors';
import { DEFAULT_THEME_NAME, THEMES } from './themes';

/**
 * Build the pre-hydration background CSS string.
 *
 * @param light - Light-scheme color palette. Defaults to the app tokens;
 *   injectable so the builder is unit-testable in isolation.
 * @param dark  - Dark-scheme color palette. Defaults to the app tokens.
 * @returns A CSS string setting the page background to the dark token by
 *   default and the light token under `prefers-color-scheme: light`.
 */
export function buildPreHydrationBackgroundCss(
  light: ColorPalette = THEMES[DEFAULT_THEME_NAME].light.colors,
  dark: ColorPalette = THEMES[DEFAULT_THEME_NAME].dark.colors,
): string {
  return [
    ':root { color-scheme: dark; }',
    `html, body { background-color: ${dark.background}; }`,
    '@media (prefers-color-scheme: light) {',
    '  :root { color-scheme: light; }',
    `  html, body { background-color: ${light.background}; }`,
    '}',
  ].join('\n');
}
