import type { ColorPalette } from '../colors';
import { INTENT_COLORS } from '../intents';
import { THEMES, THEME_NAMES } from '../themes';
import {
  AA_NORMAL_TEXT,
  AA_NON_TEXT,
  contrastRatio,
  hexToRgb,
  meetsAA,
  relativeLuminance,
} from '../contrast';

describe('contrast utilities', () => {
  it('parses 6-digit and 3-digit hex', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('4263EB')).toEqual({ r: 66, g: 99, b: 235 });
  });

  it('throws on malformed hex', () => {
    expect(() => hexToRgb('#12')).toThrow();
    expect(() => hexToRgb('not-a-color')).toThrow();
  });

  it('luminance is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('contrast ratio is 21:1 for black on white and 1:1 for identical colors', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrastRatio('#4263EB', '#4263EB')).toBeCloseTo(1, 5);
  });

  it('contrast ratio is order-independent', () => {
    expect(contrastRatio('#212529', '#FFFFFF')).toBeCloseTo(
      contrastRatio('#FFFFFF', '#212529'),
      5,
    );
  });

  it('meetsAA respects the supplied threshold', () => {
    expect(meetsAA('#6C757D', '#FFFFFF')).toBe(true); // 4.69:1 >= 4.5
    expect(meetsAA('#ADB5BD', '#FFFFFF')).toBe(false); // disabled grey fails 4.5
    expect(meetsAA('#ADB5BD', '#FFFFFF', AA_NON_TEXT)).toBe(false); // and 3.0
  });
});

/**
 * The contract these tables encode is the WCAG AA audit.
 * Every pair below is a *deliberate* foreground/background combination the
 * theme promises; a token edit that breaks any of them must fail CI.
 *
 * Exemptions (intentionally not asserted): `textDisabled` (WCAG 1.4.3 exempts
 * disabled controls) and `border` / `borderSubtle` (subtle, decorative
 * dividers — WCAG 1.4.11 exempts purely decorative elements). See
 * docs/accessibility-checklist.md.
 */

/** Body-text foregrounds expected to clear AA normal text on every surface. */
const TEXT_FOREGROUNDS: (keyof ColorPalette)[] = [
  'textPrimary',
  'textSecondary',
];
const TEXT_SURFACES: (keyof ColorPalette)[] = [
  'background',
  'surface',
  'surfaceVariant',
];

/**
 * Filled foreground/background pairs: button, chip, toast and badge labels.
 * `textInverse` on `textSecondary` is the solid neutral badge in AppBadge.
 */
const ON_PAIRS: [keyof ColorPalette, keyof ColorPalette][] = [
  ['onPrimary', 'primary'],
  ['onPrimary', 'primaryVariant'],
  ['onSecondary', 'secondary'],
  ['onSecondary', 'secondaryVariant'],
  ['onSuccess', 'success'],
  ['onWarning', 'warning'],
  ['onError', 'error'],
  ['onInfo', 'info'],
  ['textInverse', 'textSecondary'],
];

/**
 * The `base` colour of every intent in INTENT_COLORS. Components also draw it
 * as text on a plain surface: AppText tones, links, outline and ghost buttons,
 * and soft and outline badges (soft badges sit on `surfaceVariant`). So it is
 * held to the normal-text bar on every text surface, which also clears the
 * 3:1 bar for icons and fills.
 */
const INTENT_BASES = Object.values(INTENT_COLORS).map(({ base }) => base);

function runPaletteAudit(name: string, palette: ColorPalette): void {
  describe(`${name} palette WCAG AA`, () => {
    for (const fg of TEXT_FOREGROUNDS) {
      for (const bg of TEXT_SURFACES) {
        it(`${fg} on ${bg} meets AA normal text (>= ${AA_NORMAL_TEXT}:1)`, () => {
          expect(
            contrastRatio(palette[fg], palette[bg]),
          ).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
        });
      }
    }

    for (const [fg, bg] of ON_PAIRS) {
      it(`${fg} on ${bg} meets AA normal text (>= ${AA_NORMAL_TEXT}:1)`, () => {
        expect(contrastRatio(palette[fg], palette[bg])).toBeGreaterThanOrEqual(
          AA_NORMAL_TEXT,
        );
      });
    }

    for (const base of INTENT_BASES) {
      for (const bg of TEXT_SURFACES) {
        it(`${base} on ${bg} meets AA normal text (>= ${AA_NORMAL_TEXT}:1)`, () => {
          expect(
            contrastRatio(palette[base], palette[bg]),
          ).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
        });
      }
    }
  });
}

// Every registered theme is audited, so a new theme cannot skip the audit.
for (const name of THEME_NAMES) {
  const { label, light, dark } = THEMES[name];
  runPaletteAudit(`${label} light`, light.colors);
  runPaletteAudit(`${label} dark`, dark.colors);
}
