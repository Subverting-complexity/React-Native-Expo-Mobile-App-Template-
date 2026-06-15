import { createContext } from 'react';

/** Semantic intent of a toast, mapped to palette colours by {@link AppToast}. */
export type ToastTone = 'info' | 'success' | 'warning' | 'error';

/** Optional inline action rendered as a button inside the toast. */
export interface ToastAction {
  /** Visible label and screen-reader name for the action. */
  label: string;
  onPress: () => void;
}

/** Per-toast options accepted by {@link ToastContextValue.show}. */
export interface ToastOptions {
  /** Intent / colour. Defaults to `info`. */
  tone?: ToastTone;
  /**
   * Auto-dismiss delay in ms. Defaults to 4000. Pass `0` to make the toast
   * sticky (dismissed only by the close button or the next `show`).
   */
  duration?: number;
  /** Optional action button. */
  action?: ToastAction;
}

/** Imperative toast API exposed through {@link useToast}. */
export interface ToastContextValue {
  /** Show a toast, replacing any toast currently on screen. */
  show: (message: string, options?: ToastOptions) => void;
  /** Dismiss the current toast, if any. */
  dismiss: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
