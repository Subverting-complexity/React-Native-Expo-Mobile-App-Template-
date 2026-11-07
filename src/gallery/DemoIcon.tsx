import { AppText } from '@/components';
import type { AppIcon, AppIconRenderProps, TextTone } from '@/components';

/**
 * The `App*` components depend on no icon library. Their icon slots accept any
 * node, or a render function that receives the resolved `{ color, size }`. The
 * gallery shows that contract with Unicode glyphs. The app itself uses
 * Ionicons from `@expo/vector-icons` (tab bar, placeholders); a project can
 * pass those, or any other icon set, without touching the components.
 */

/** Builds an `AppIcon` render function that draws a glyph at the slot's colour/size. */
export function glyphIcon(glyph: string): AppIcon {
  // Named so the render function reads as a proper component (display name).
  function GlyphIcon({ color, size }: AppIconRenderProps) {
    return (
      <AppText style={{ color, fontSize: size, lineHeight: size }}>
        {glyph}
      </AppText>
    );
  }
  return GlyphIcon;
}

/** A plain node for `ReactNode` icon slots (chips, list items, links, empty state). */
export function GlyphNode({
  glyph,
  tone = 'secondary',
}: {
  glyph: string;
  tone?: TextTone;
}) {
  return <AppText tone={tone}>{glyph}</AppText>;
}
