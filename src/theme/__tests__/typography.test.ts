import { FONT_FAMILIES, typography } from '../typography';

describe('FONT_FAMILIES', () => {
  it('exports a sans token for the regular Atkinson Hyperlegible variant', () => {
    expect(FONT_FAMILIES.sans).toBe('AtkinsonHyperlegible_400Regular');
  });

  it('exports a sansBold token', () => {
    expect(FONT_FAMILIES.sansBold).toBe('AtkinsonHyperlegible_700Bold');
  });

  it('exports a sansItalic token', () => {
    expect(FONT_FAMILIES.sansItalic).toBe('AtkinsonHyperlegible_400Regular_Italic');
  });

  it('exports a sansBoldItalic token', () => {
    expect(FONT_FAMILIES.sansBoldItalic).toBe('AtkinsonHyperlegible_700Bold_Italic');
  });

  it('has exactly four font family tokens', () => {
    expect(Object.keys(FONT_FAMILIES)).toHaveLength(4);
  });
});

describe('typography.families', () => {
  it('sans uses Atkinson Hyperlegible regular', () => {
    expect(typography.families.sans).toBe('AtkinsonHyperlegible_400Regular');
  });

  it('mono is unchanged', () => {
    expect(typography.families.mono).toBeDefined();
  });
});
