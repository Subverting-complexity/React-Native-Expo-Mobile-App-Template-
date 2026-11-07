import React from 'react';
import { act, render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';
import { A11yContext, MAX_FONT_SIZE_MULTIPLIER } from '@/a11y';
import { ApiProvider, type ApiClient } from '@/api';
import { makeStorage } from './storage';

/** Render, then let `ThemeProvider` finish reading the saved choices. */
export async function renderHydrated(
  ui: React.ReactElement,
  options?: Parameters<typeof render>[1],
) {
  const result = render(ui, options);
  await act(async () => {});
  return result;
}

export function renderWithTheme(
  ui: React.ReactElement,
  saved: string | null = null,
) {
  return renderHydrated(
    <ThemeProvider storage={makeStorage(saved)}>{ui}</ThemeProvider>,
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    reduceMotion = true,
    saved = null,
    api,
  }: {
    reduceMotion?: boolean;
    saved?: string | null;
    /** A fake data layer for screens that call `useApi()`. */
    api?: ApiClient;
  } = {},
) {
  return renderHydrated(
    <ThemeProvider storage={makeStorage(saved)}>
      <A11yContext.Provider
        value={{
          reduceMotion,
          maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER,
        }}
      >
        {api ? <ApiProvider client={api}>{ui}</ApiProvider> : ui}
      </A11yContext.Provider>
    </ThemeProvider>,
  );
}
