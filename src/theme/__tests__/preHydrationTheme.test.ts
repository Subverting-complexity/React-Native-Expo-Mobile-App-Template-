import { lightColors, darkColors } from '../colors';
import { buildPreHydrationBackgroundCss } from '../preHydrationTheme';

describe('buildPreHydrationBackgroundCss', () => {
  it('uses the dark background token as the default', () => {
    const css = buildPreHydrationBackgroundCss();

    expect(css).toContain(`background-color: ${darkColors.background}`);
    expect(css).toContain(':root { color-scheme: dark; }');
  });

  it('switches to the light token under prefers-color-scheme: light', () => {
    const css = buildPreHydrationBackgroundCss();

    expect(css).toContain('@media (prefers-color-scheme: light)');
    expect(css).toContain(`background-color: ${lightColors.background}`);
    expect(css).toContain('color-scheme: light;');
  });

  it('targets both html and body so the whole page is covered', () => {
    const css = buildPreHydrationBackgroundCss();

    expect(css).toContain('html, body {');
  });

  it('reads values from the injected palette rather than hardcoding them', () => {
    const css = buildPreHydrationBackgroundCss(
      { ...lightColors, background: 'rebeccapurple' },
      { ...darkColors, background: 'midnightblue' },
    );

    expect(css).toContain('background-color: midnightblue');
    expect(css).toContain('background-color: rebeccapurple');
    // Default tokens must not leak through when a palette is injected.
    expect(css).not.toContain(lightColors.background);
    expect(css).not.toContain(darkColors.background);
  });
});
