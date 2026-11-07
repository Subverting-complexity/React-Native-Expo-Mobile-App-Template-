import {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { AppToast, defaultToastDuration } from './AppToast';
import {
  ToastContext,
  type ToastContextValue,
  type ToastOptions,
} from './ToastContext';
import { useTheme } from '@/theme';

interface ToastState extends Required<Omit<ToastOptions, 'action'>> {
  /** Monotonic id; used as the `key` so each `show` re-mounts the toast. */
  id: number;
  message: string;
  action: ToastOptions['action'];
}

interface ToastProviderProps {
  children: ReactNode;
  /**
   * Points to keep clear above the bottom safe area, such as the height of a
   * tab bar, so the toast does not cover it. Defaults to 0.
   */
  bottomOffset?: number;
}

/**
 * App-wide toast host. Provides the {@link useToast} `show`/`dismiss` API and
 * renders the active toast in a fixed overlay above the rest of the tree at the
 * `toast` z-index token. The toast sits at the bottom, above the safe area and
 * `bottomOffset`. Only one toast is shown at a time — a new `show`
 * replaces the current one. Mount this once near the app root, inside the theme
 * and accessibility providers.
 */
export function ToastProvider({
  children,
  bottomOffset = 0,
}: ToastProviderProps) {
  const { theme } = useTheme();
  // Read the context, not useSafeAreaInsets, so the provider also works
  // without a SafeAreaProvider (as in tests): the inset is then 0.
  const bottomInset = useContext(SafeAreaInsetsContext)?.bottom ?? 0;
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);

  const dismiss = useCallback(() => setToast(null), []);

  const show = useCallback((message: string, options?: ToastOptions) => {
    nextId.current += 1;
    setToast({
      id: nextId.current,
      message,
      tone: options?.tone ?? 'info',
      duration: options?.duration ?? defaultToastDuration(options?.action),
      action: options?.action,
    });
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ show, dismiss }),
    [show, dismiss],
  );

  const overlayStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      left: theme.spacing[4],
      right: theme.spacing[4],
      bottom: bottomInset + bottomOffset + theme.spacing[4],
      zIndex: theme.zIndex.toast,
      elevation: theme.zIndex.toast,
    }),
    [theme, bottomInset, bottomOffset],
  );

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {toast ? (
          <View
            style={overlayStyle}
            pointerEvents="box-none"
            testID="toast-overlay"
          >
            <AppToast
              key={toast.id}
              message={toast.message}
              tone={toast.tone}
              duration={toast.duration}
              action={toast.action}
              onDismiss={dismiss}
              testID="toast"
            />
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
