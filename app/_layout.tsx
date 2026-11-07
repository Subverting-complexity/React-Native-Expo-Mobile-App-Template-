import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';

import { ApiProvider } from '@/api';
import { DefaultErrorFallback, ToastProvider } from '@/components';
import { A11yProvider } from '@/a11y';
import { useAppFonts } from '@/hooks';
import { tabBarContentHeight } from '@/navigation';
import { ThemeProvider, useTheme } from '@/theme';

// Keep the native splash screen up until the fonts and the saved theme are ready.
SplashScreen.preventAutoHideAsync();

/** Expo Router shows this in place of the app when a screen throws while it renders. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <DefaultErrorFallback error={error} reset={retry} />;
}

/** Renders the app, and hides the splash screen, once the fonts and the saved theme are ready. */
function WhenReady({
  fontsReady,
  children,
}: {
  fontsReady: boolean;
  children: ReactNode;
}) {
  const { hydrated } = useTheme();
  const ready = fontsReady && hydrated;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  return ready ? children : null;
}

/** Shows toasts at the bottom of the screen, above the tab bar. */
function ToastHost({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <ToastProvider bottomOffset={tabBarContentHeight(theme)}>
      {children}
    </ToastProvider>
  );
}

/** Status bar content that contrasts with the app's scheme, not the OS scheme. */
function ThemedStatusBar() {
  const { colorScheme } = useTheme();
  return <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  // A font load error renders with the system font rather than blocking forever.
  const fontsReady = fontsLoaded || fontError !== null;

  return (
    <ThemeProvider>
      <WhenReady fontsReady={fontsReady}>
        <A11yProvider>
          <ApiProvider>
            <ToastHost>
              {/* The (tabs) group renders its own Tabs header; hide the Stack
                  header so the two do not stack on top of each other. */}
              <Stack screenOptions={{ headerShown: false }} />
            </ToastHost>
          </ApiProvider>
          <ThemedStatusBar />
        </A11yProvider>
      </WhenReady>
    </ThemeProvider>
  );
}
