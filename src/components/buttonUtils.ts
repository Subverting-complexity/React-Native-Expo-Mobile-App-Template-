import type { ReactNode } from 'react';
import { INTENT_COLORS } from '@/theme';
import type { ColorPalette, ThemeTokens } from '@/theme';

const { primary, secondary, error } = INTENT_COLORS;

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
  primary: { background: primary.base, foreground: primary.on, border: null },
  secondary: {
    background: secondary.base,
    foreground: secondary.on,
    border: null,
  },
  outline: {
    background: 'transparent',
    foreground: primary.base,
    border: primary.base,
  },
  ghost: { background: 'transparent', foreground: primary.base, border: null },
  danger: { background: error.base, foreground: error.on, border: null },
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
