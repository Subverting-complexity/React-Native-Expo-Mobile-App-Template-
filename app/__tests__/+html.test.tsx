import { renderToStaticMarkup } from 'react-dom/server';
import Root from '../+html';

jest.mock('expo-router/html', () => ({
  ScrollViewStyleReset: () => null,
}));

jest.mock('@/theme/preHydrationTheme', () => ({
  buildPreHydrationBackgroundCss: jest.fn(
    () => 'html, body { background-color: #000000; }',
  ),
}));

describe('Root (+html.tsx)', () => {
  it('renders the HTML shell without throwing', () => {
    expect(() => renderToStaticMarkup(<Root>{null}</Root>)).not.toThrow();
  });

  it('injects a pre-hydration style tag into the document head', () => {
    const html = renderToStaticMarkup(<Root>{null}</Root>);

    expect(html).toContain('<style>');
    expect(html).toContain('background-color');
  });
});
