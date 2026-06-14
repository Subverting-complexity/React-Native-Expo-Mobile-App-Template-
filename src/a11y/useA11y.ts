import { useContext } from 'react';

import { A11yContext, type A11yContextValue } from './A11yContext';

/**
 * Reads the full accessibility state. Must be called inside `<A11yProvider>`.
 */
export function useA11y(): A11yContextValue {
  const ctx = useContext(A11yContext);
  if (ctx === null) {
    throw new Error('useA11y must be called inside <A11yProvider>');
  }
  return ctx;
}

/**
 * Convenience selector for the reduce-motion preference. Use it to skip or
 * shorten animations when the user has asked for reduced motion.
 */
export function useReduceMotion(): boolean {
  return useA11y().reduceMotion;
}
