// Web-only root HTML shell.
//
// Expo Router (web `output: 'static'`) renders this file to the static HTML
// document that wraps every web route. Native platforms ignore it entirely.
// The injected <style> sets the page background before React hydrates so there
// is no white/dark flash on first paint (issue #17).

import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { buildPreHydrationBackgroundCss } from '@/theme/preHydrationTheme';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {/* Reset default body margins and disable body scroll on web. */}
        <ScrollViewStyleReset />
        {/* Pre-hydration background — prevents the first-paint theme flash. */}
        <style
          dangerouslySetInnerHTML={{ __html: buildPreHydrationBackgroundCss() }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
