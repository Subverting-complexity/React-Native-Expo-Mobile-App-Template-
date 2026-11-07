import { standardLightColors, standardDarkColors } from '../colors';
import { spacing } from '../spacing';
import { radii } from '../radii';
import { typography } from '../typography';
import { iosShadows, androidShadows, webShadows } from '../shadows';
import { zIndex } from '../zIndex';
import { a11y } from '../a11y';

describe('color palettes', () => {
  it('light palette has all required keys', () => {
    expect(standardLightColors.background).toBeDefined();
    expect(standardLightColors.surface).toBeDefined();
    expect(standardLightColors.textPrimary).toBeDefined();
    expect(standardLightColors.primary).toBeDefined();
    expect(standardLightColors.error).toBeDefined();
  });

  it('dark palette has all required keys', () => {
    expect(standardDarkColors.background).toBeDefined();
    expect(standardDarkColors.surface).toBeDefined();
    expect(standardDarkColors.textPrimary).toBeDefined();
    expect(standardDarkColors.primary).toBeDefined();
    expect(standardDarkColors.error).toBeDefined();
  });

  it('light and dark backgrounds differ', () => {
    expect(standardLightColors.background).not.toBe(
      standardDarkColors.background,
    );
  });

  it('all color values are strings', () => {
    for (const [, value] of Object.entries(standardLightColors)) {
      expect(typeof value).toBe('string');
    }
  });
});

describe('spacing scale', () => {
  it('contains expected steps', () => {
    expect(spacing[1]).toBe(4);
    expect(spacing[2]).toBe(8);
    expect(spacing[4]).toBe(16);
    expect(spacing[8]).toBe(32);
  });

  it('all values are positive numbers', () => {
    for (const [, value] of Object.entries(spacing)) {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('radii scale', () => {
  it('none is 0', () => {
    expect(radii.none).toBe(0);
  });

  it('full is very large', () => {
    expect(radii.full).toBeGreaterThan(100);
  });

  it('scale is monotonically increasing (none < xs < sm < md < lg < xl)', () => {
    expect(radii.none).toBeLessThan(radii.xs);
    expect(radii.xs).toBeLessThan(radii.sm);
    expect(radii.sm).toBeLessThan(radii.md);
    expect(radii.md).toBeLessThan(radii.lg);
    expect(radii.lg).toBeLessThan(radii.xl);
  });
});

describe('typography tokens', () => {
  it('has a sans font family', () => {
    expect(typography.families.sans).toBeDefined();
  });

  it('text sizes have required variant shape', () => {
    const { md } = typography.sizes;
    expect(md).toHaveProperty('fontSize');
    expect(md).toHaveProperty('lineHeight');
    expect(md).toHaveProperty('letterSpacing');
  });

  it('font sizes are monotonically increasing', () => {
    const sizes = typography.sizes;
    expect(sizes.xs.fontSize).toBeLessThan(sizes.sm.fontSize);
    expect(sizes.sm.fontSize).toBeLessThan(sizes.md.fontSize);
    expect(sizes.md.fontSize).toBeLessThan(sizes.lg.fontSize);
    expect(sizes.lg.fontSize).toBeLessThan(sizes.xl.fontSize);
    expect(sizes.xl.fontSize).toBeLessThan(sizes['2xl'].fontSize);
    expect(sizes['2xl'].fontSize).toBeLessThan(sizes['3xl'].fontSize);
    expect(sizes['3xl'].fontSize).toBeLessThan(sizes['4xl'].fontSize);
  });
});

describe('shadow tokens', () => {
  it('iOS shadows include shadowColor', () => {
    const s = iosShadows.md as { shadowColor: string };
    expect(s.shadowColor).toBeDefined();
  });

  it('Android shadows use elevation', () => {
    const s = androidShadows.md as { elevation: number };
    expect(typeof s.elevation).toBe('number');
    expect(s.elevation).toBeGreaterThan(0);
  });

  it('web shadows use boxShadow string', () => {
    const s = webShadows.md as { boxShadow: string };
    expect(typeof s.boxShadow).toBe('string');
  });

  it('none shadow has no elevation / transparent', () => {
    const androidNone = androidShadows.none as { elevation: number };
    expect(androidNone.elevation).toBe(0);
  });
});

describe('z-index scale', () => {
  it('base is 0', () => {
    expect(zIndex.base).toBe(0);
  });

  it('modal is above overlay', () => {
    expect(zIndex.modal).toBeGreaterThan(zIndex.overlay);
  });

  it('toast is the highest', () => {
    const allValues = Object.values(zIndex);
    expect(zIndex.toast).toBe(Math.max(...allValues));
  });
});

describe('a11y tokens', () => {
  it('minimum touch target is 44 (WCAG 2.5.5 / HIG)', () => {
    expect(a11y.minTouchTarget).toBe(44);
  });

  it('minimum touch target is a positive number', () => {
    expect(typeof a11y.minTouchTarget).toBe('number');
    expect(a11y.minTouchTarget).toBeGreaterThan(0);
  });
});
