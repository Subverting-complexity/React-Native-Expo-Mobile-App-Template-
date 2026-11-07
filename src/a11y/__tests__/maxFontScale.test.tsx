import { MAX_FONT_SIZE_MULTIPLIER, fontScaleFactor } from '../maxFontScale';

describe('fontScaleFactor', () => {
  it('follows the OS font scale below the cap', () => {
    expect(fontScaleFactor(1.2, true, MAX_FONT_SIZE_MULTIPLIER)).toBe(1.2);
  });

  it('stops at the cap', () => {
    expect(fontScaleFactor(3, true, MAX_FONT_SIZE_MULTIPLIER)).toBe(
      MAX_FONT_SIZE_MULTIPLIER,
    );
  });

  it('follows the OS font scale with no cap when the cap is null or undefined', () => {
    expect(fontScaleFactor(3, true, null)).toBe(3);
    expect(fontScaleFactor(3, true, undefined)).toBe(3);
  });

  it('is 1 when font scaling is off', () => {
    expect(fontScaleFactor(3, false, MAX_FONT_SIZE_MULTIPLIER)).toBe(1);
  });
});
