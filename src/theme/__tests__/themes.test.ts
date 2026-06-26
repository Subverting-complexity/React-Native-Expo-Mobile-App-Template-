import { lightTheme, darkTheme } from '../themes';

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

  it('builds lightTheme and darkTheme with every token category', () => {
    for (const key of categories) {
      expect(lightTheme).toHaveProperty(key);
      expect(darkTheme).toHaveProperty(key);
    }
  });

  it('shares non-color token references between the two themes', () => {
    expect(lightTheme.spacing).toBe(darkTheme.spacing);
    expect(lightTheme.radii).toBe(darkTheme.radii);
    expect(lightTheme.typography).toBe(darkTheme.typography);
    expect(lightTheme.zIndex).toBe(darkTheme.zIndex);
    expect(lightTheme.a11y).toBe(darkTheme.a11y);
  });

  it('gives each theme a distinct color palette', () => {
    expect(lightTheme.colors).not.toBe(darkTheme.colors);
    expect(lightTheme.colors.background).not.toBe(darkTheme.colors.background);
  });
});
