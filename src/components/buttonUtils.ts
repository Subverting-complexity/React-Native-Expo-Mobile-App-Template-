import type { ReactNode } from 'react';
import type { ColorPalette, ThemeTokens } from '@/theme';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

export interface VariantColors {
  background: keyof ColorPalette | 'transparent';
  foreground: keyof ColorPalette;
  border: keyof ColorPalette | null;
}

export const BUTTON_VARIANTS: Record<ButtonVariant, VariantColors> = {
  primary: { background: 'primary', foreground: 'onPrimary', border: null },
  secondary: {
    background: 'secondary',
    foreground: 'onSecondary',
    border: null,
  },
  outline: {
    background: 'transparent',
    foreground: 'primary',
    border: 'primary',
  },
  ghost: { background: 'transparent', foreground: 'primary', border: null },
  danger: { background: 'error', foreground: 'onError', border: null },
};

export interface ResolvedColors {
  background: string;
  foreground: string;
  border: string | undefined;
}

export function resolveVariantColors(
  theme: ThemeTokens,
  v: VariantColors,
): ResolvedColors {
  return {
    background:
      v.background === 'transparent'
        ? 'transparent'
        : theme.colors[v.background],
    foreground: theme.colors[v.foreground],
    border: v.border ? theme.colors[v.border] : undefined,
  };
}

export interface AppIconRenderProps {
  color: string;
  size: number;
}

export type AppIcon = ReactNode | ((props: AppIconRenderProps) => ReactNode);
