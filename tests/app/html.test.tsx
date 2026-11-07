import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Root from '../../app/+html';

jest.mock('expo-router/html', () => ({
  ScrollViewStyleReset: () => null,
}));

jest.mock('@/theme/preHydrationTheme', () => ({
  buildPreHydrationBackgroundCss: jest.fn(
    () => 'html, body { background-color: #000000; }',
  ),
}));

function renderShell(): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<Root>{null}</Root>);
  });
  if (!renderer) {
    throw new Error('The HTML shell did not render');
  }
  return renderer;
}

describe('Root (+html.tsx)', () => {
  it('renders the HTML shell with a head and a body', () => {
    const { root } = renderShell();
    root.findByType('head');
    root.findByType('body');
  });

  it('injects a pre-hydration style tag into the document head', () => {
    const style = renderShell().root.findByType('head').findByType('style');

    expect(style.props.dangerouslySetInnerHTML.__html).toContain(
      'background-color',
    );
  });
});
