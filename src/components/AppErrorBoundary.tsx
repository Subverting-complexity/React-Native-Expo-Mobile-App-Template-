import {
  Component,
  useContext,
  useMemo,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import {
  Pressable,
  Text,
  useColorScheme,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { A11Y_ROLES } from '@/a11y';
import { ThemeContext, darkTheme, lightTheme } from '@/theme';
import type { ThemeTokens } from '@/theme';

/**
 * What a fallback receives: the caught error and a `reset` callback that clears
 * the error state so the boundary re-renders its children (e.g. to retry a
 * transient failure).
 */
export interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export interface AppErrorBoundaryProps {
  children: ReactNode;
  /**
   * Custom fallback rendered when a child throws. Receives the error and a
   * `reset` callback. When omitted, {@link DefaultErrorFallback} is used.
   */
  fallback?: (props: ErrorFallbackProps) => ReactNode;
  /**
   * Called once when an error is caught — wire this to crash reporting. Runs
   * after React has captured the error; never throws back into render.
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time errors in its subtree and shows a fallback instead of
 * letting the whole app unmount. React error boundaries must be class
 * components — only `getDerivedStateFromError` / `componentDidCatch` receive
 * thrown errors — so this is the one class component in the library.
 *
 * The default fallback is safe to render **outside** a `<ThemeProvider>`: it
 * reads the theme from context directly and falls back to the token palettes
 * when no provider is mounted, so a crash high in the tree (above the provider)
 * still renders a styled screen rather than a second error.
 */
export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private readonly reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error) {
      const { fallback } = this.props;
      return fallback ? (
        fallback({ error, reset: this.reset })
      ) : (
        <DefaultErrorFallback error={error} reset={this.reset} />
      );
    }
    return this.props.children;
  }
}

interface FallbackStyles {
  container: ViewStyle;
  title: TextStyle;
  message: TextStyle;
  button: ViewStyle;
  buttonLabel: TextStyle;
}

function buildFallbackStyles(theme: ThemeTokens): FallbackStyles {
  const { colors, spacing, radii, typography, a11y } = theme;
  const heading = typography.variants.heading;
  const headingSize = typography.sizes[heading.size];
  const body = typography.variants.body;
  const bodySize = typography.sizes[body.size];

  return {
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[4],
      padding: spacing[6],
      backgroundColor: colors.background,
    },
    title: {
      fontFamily: heading.family,
      fontWeight: heading.weight,
      fontSize: headingSize.fontSize,
      lineHeight: headingSize.lineHeight,
      letterSpacing: headingSize.letterSpacing,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    message: {
      fontFamily: body.family,
      fontWeight: body.weight,
      fontSize: bodySize.fontSize,
      lineHeight: bodySize.lineHeight,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    button: {
      minWidth: a11y.minTouchTarget,
      minHeight: a11y.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[5],
      borderRadius: radii.md,
      backgroundColor: colors.primary,
    },
    buttonLabel: {
      fontFamily: typography.variants.label.family,
      fontWeight: typography.variants.label.weight,
      fontSize: bodySize.fontSize,
      color: colors.onPrimary,
    },
  };
}

/**
 * Themed fallback shown by {@link AppErrorBoundary} when no custom fallback is
 * given. Resolves the theme from {@link ThemeContext} directly rather than
 * `useTheme()` so it never throws when rendered above (or without) a
 * `<ThemeProvider>`; in that case it picks the token palette matching the OS
 * color scheme. Every value comes from theme tokens — no hardcoded colors,
 * sizes, or spacing.
 */
export function DefaultErrorFallback({ error, reset }: ErrorFallbackProps) {
  const ctx = useContext(ThemeContext);
  const scheme = useColorScheme();
  const theme = ctx?.theme ?? (scheme === 'light' ? lightTheme : darkTheme);

  const styles = useMemo(() => buildFallbackStyles(theme), [theme]);

  return (
    <View
      style={styles.container}
      accessibilityRole={A11Y_ROLES.alert}
      accessibilityLiveRegion="assertive"
      testID="app-error-boundary-fallback"
    >
      <Text style={styles.title} accessibilityRole={A11Y_ROLES.header}>
        Something went wrong
      </Text>
      <Text style={styles.message}>
        {error.message || 'An unexpected error occurred.'}
      </Text>
      <Pressable
        accessibilityRole={A11Y_ROLES.button}
        accessibilityLabel="Try again"
        onPress={reset}
        style={styles.button}
      >
        <Text style={styles.buttonLabel}>Try again</Text>
      </Pressable>
    </View>
  );
}
