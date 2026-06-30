import { lightTheme, lightColors } from '@/theme';
import {
  BUTTON_VARIANTS,
  resolveVariantColors,
  type ButtonVariant,
} from '../buttonUtils';

describe('resolveVariantColors', () => {
  it('resolves the primary variant to concrete theme colours', () => {
    const result = resolveVariantColors(lightTheme, BUTTON_VARIANTS.primary);
    expect(result.background).toBe(lightColors.primary);
    expect(result.foreground).toBe(lightColors.onPrimary);
    expect(result.border).toBeUndefined();
  });

  it('resolves the outline variant with a border and transparent fill', () => {
    const result = resolveVariantColors(lightTheme, BUTTON_VARIANTS.outline);
    expect(result.background).toBe('transparent');
    expect(result.foreground).toBe(lightColors.primary);
    expect(result.border).toBe(lightColors.primary);
  });

  it('resolves the danger variant to error colours', () => {
    const result = resolveVariantColors(lightTheme, BUTTON_VARIANTS.danger);
    expect(result.background).toBe(lightColors.error);
    expect(result.foreground).toBe(lightColors.onError);
    expect(result.border).toBeUndefined();
  });

  it('resolves all five variants without throwing', () => {
    const variants: ButtonVariant[] = [
      'primary',
      'secondary',
      'outline',
      'ghost',
      'danger',
    ];
    for (const v of variants) {
      const result = resolveVariantColors(lightTheme, BUTTON_VARIANTS[v]);
      expect(typeof result.background).toBe('string');
      expect(typeof result.foreground).toBe('string');
    }
  });
});
