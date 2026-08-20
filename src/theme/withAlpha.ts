/**
 * Derive a translucent variant of a solid palette token.
 *
 * One accent token can drive several tonal tiers (a 12% wash behind a chip,
 * a 40% pressed state, a 70% scrim) without adding a palette entry per tier —
 * which keeps the palette small and means a re-skin automatically re-skins
 * every derived tone. Use it at style-build time with a token from
 * `useTheme()`, never with a hardcoded hex:
 *
 *   backgroundColor: withAlpha(theme.colors.primary, 0.12)
 *
 * Accepts `#RGB` or `#RRGGBB` and returns `#RRGGBBAA`. Throws on any other
 * input so a malformed token surfaces immediately instead of silently
 * painting the wrong color (same policy as the contrast utilities).
 */
export function withAlpha(hex: string, alpha: number): string {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!match) {
    throw new Error(
      `withAlpha expects #RGB or #RRGGBB, got '${hex}'. Pass a solid palette token.`,
    );
  }

  const rgb =
    match[1].length === 3
      ? match[1]
          .split('')
          .map((channel) => channel + channel)
          .join('')
      : match[1];

  const clamped = Math.min(1, Math.max(0, alpha));
  const alphaByte = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0');

  return `#${rgb}${alphaByte}`;
}
