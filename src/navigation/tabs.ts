import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { ThemeTokens } from '@/theme';

/**
 * The tab bar height above the bottom safe area. The default 49pt bar clips
 * the label under the icon. The tab layout uses this, and the root layout
 * keeps toasts above it.
 */
export function tabBarContentHeight(theme: ThemeTokens): number {
  return theme.spacing[16];
}

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** An Ionicons glyph that also has an `-outline` version. */
export type TabIconName = {
  [K in IoniconName]: `${K}-outline` extends IoniconName ? K : never;
}[IoniconName];

export interface TabDefinition {
  /** The screen header title, and the tab's screen-reader label. */
  title: string;
  /** The short label under the icon, when the title is too long for it. */
  label?: string;
  /** Shown filled on the active tab and as its outline on the others. */
  icon: TabIconName;
}

/**
 * The bottom tabs, in display order, keyed by their route file in
 * `app/(tabs)/`. `index` is the first tab, so the app opens on it. To add a
 * tab, add a route file in `app/(tabs)/` and an entry here; a test fails
 * when the two disagree.
 */
export const TABS = {
  index: { title: 'Home', icon: 'home' },
  explore: { title: 'Explore', icon: 'compass' },
  settings: { title: 'Settings', icon: 'settings' },
} satisfies Record<string, TabDefinition>;

export type TabName = keyof typeof TABS;

export const TAB_NAMES = Object.keys(TABS) as TabName[];

export function outlineIcon(icon: TabIconName): IoniconName {
  return `${icon}-outline`;
}
