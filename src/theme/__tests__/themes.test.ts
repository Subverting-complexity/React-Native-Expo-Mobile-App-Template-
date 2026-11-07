import {
  DEFAULT_THEME_NAME,
  THEMES,
  THEME_NAMES,
  isThemeName,
} from '../themes';

// These assertions deliberately import from '../themes' (not the barrel) to
// lock the extraction: theme assembly must live in its own module so the
// barrel only re-exports. Importing the built themes here without touching
// '../index' is what keeps ThemeProvider/ThemeContext free of a barrel cycle.
describe('themes module', () => {
  const categories = [
    'colors',
    'spacing',
    'radii',
    'typography',
    'shadows',
    'zIndex',
    'a11y',
  ] as const;
  const definitions = Object.values(THEMES);
  const allThemes = definitions.flatMap(({ light, dark }) => [light, dark]);

  it('builds every theme with every token category', () => {
    for (const theme of allThemes) {
      for (const key of categories) {
        expect(theme).toHaveProperty(key);
      }
    }
  });

  it('gives each theme a label and a different light and dark version', () => {
    for (const { label, light, dark } of definitions) {
      expect(label).not.toBe('');
      expect(light.colors).not.toBe(dark.colors);
    }
  });

  it('lists every theme name once, with the default among them', () => {
    expect(THEME_NAMES).toEqual(Object.keys(THEMES));
    expect(THEME_NAMES).toContain(DEFAULT_THEME_NAME);
  });

  it('accepts only the theme names', () => {
    for (const name of THEME_NAMES) {
      expect(isThemeName(name)).toBe(true);
    }
    expect(isThemeName('light')).toBe(false);
    expect(isThemeName('toString')).toBe(false);
    expect(isThemeName(null)).toBe(false);
  });

  it('shares non-color token references between the themes', () => {
    const [first] = allThemes;
    for (const theme of allThemes) {
      expect(theme.spacing).toBe(first.spacing);
      expect(theme.radii).toBe(first.radii);
      expect(theme.typography).toBe(first.typography);
      expect(theme.zIndex).toBe(first.zIndex);
      expect(theme.a11y).toBe(first.a11y);
    }
  });

  it('gives every theme and mode its own palette', () => {
    const palettes = allThemes.map((theme) => JSON.stringify(theme.colors));
    expect(new Set(palettes).size).toBe(allThemes.length);
  });
});
