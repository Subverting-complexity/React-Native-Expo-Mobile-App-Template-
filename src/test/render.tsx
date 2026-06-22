import React from 'react';
import { render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';
import { A11yContext, MAX_FONT_SIZE_MULTIPLIER } from '@/a11y';
import { makeStorage } from './storage';

export function renderWithTheme(
  ui: React.ReactElement,
  saved: string | null = null,
) {
  return render(
    <ThemeProvider storage={makeStorage(saved)}>{ui}</ThemeProvider>,
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    reduceMotion = true,
    saved = null,
  }: { reduceMotion?: boolean; saved?: string | null } = {},
) {
  return render(
    <ThemeProvider storage={makeStorage(saved)}>
      <A11yContext.Provider
        value={{
          reduceMotion,
          maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER,
        }}
      >
        {ui}
      </A11yContext.Provider>
    </ThemeProvider>,
  );
}
