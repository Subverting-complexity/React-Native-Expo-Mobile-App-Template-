import { standardLightColors, standardDarkColors } from '../colors';
import { buildPreHydrationBackgroundCss } from '../preHydrationTheme';

describe('buildPreHydrationBackgroundCss', () => {
  it('uses the dark background token as the default', () => {
    const css = buildPreHydrationBackgroundCss();

    expect(css).toContain(`background-color: ${standardDarkColors.background}`);
    expect(css).toContain(':root { color-scheme: dark; }');
  });

  it('switches to the light token under prefers-color-scheme: light', () => {
    const css = buildPreHydrationBackgroundCss();

    expect(css).toContain('@media (prefers-color-scheme: light)');
    expect(css).toContain(
      `background-color: ${standardLightColors.background}`,
    );
    expect(css).toContain('color-scheme: light;');
  });

  it('targets both html and body so the whole page is covered', () => {
    const css = buildPreHydrationBackgroundCss();

    expect(css).toContain('html, body {');
  });

  it('reads values from the injected palette rather than hardcoding them', () => {
    const css = buildPreHydrationBackgroundCss(
      { ...standardLightColors, background: 'rebeccapurple' },
      { ...standardDarkColors, background: 'midnightblue' },
    );

    expect(css).toContain('background-color: midnightblue');
    expect(css).toContain('background-color: rebeccapurple');
    // Default tokens must not leak through when a palette is injected.
    expect(css).not.toContain(standardLightColors.background);
    expect(css).not.toContain(standardDarkColors.background);
  });
});
