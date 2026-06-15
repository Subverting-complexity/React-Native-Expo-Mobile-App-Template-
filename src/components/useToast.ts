import { useContext } from 'react';

import { ToastContext, type ToastContextValue } from './ToastContext';

/**
 * Imperative toast API. Must be called inside {@link ToastProvider}.
 *
 * @example
 * const { show } = useToast();
 * show('Saved', { tone: 'success' });
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx === null) {
    throw new Error('useToast must be called inside <ToastProvider>');
  }
  return ctx;
}
