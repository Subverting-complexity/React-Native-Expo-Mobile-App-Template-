import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppFonts } from '../src/hooks/useAppFonts';

import { A11yProvider } from '@/a11y';
import { ThemeProvider } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();

  // Hold the render (and the native splash screen) until fonts are ready.
  // Propagating a font load error allows the app to render with the system
  // font fallback rather than blocking indefinitely.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <A11yProvider>
        <Stack />
        <StatusBar style="auto" />
      </A11yProvider>
    </ThemeProvider>
  );
}
