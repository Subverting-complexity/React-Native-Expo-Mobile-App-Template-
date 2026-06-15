import type { AccessibilityRole } from 'react-native';

/**
 * Semantic accessibility-role conventions for the app.
 *
 * React Native's `accessibilityRole` accepts a wide union of string literals.
 * Spreading those raw strings across the codebase makes them magic values: a
 * typo silently ships an unannounced control, and there is no single place
 * that says "this is the role we use for X". This map is that single place —
 * every `App*` component references a named token here instead of an inline
 * string, the same way colours and spacing come from the theme.
 *
 * Conventions:
 *
 * - **`header`** — a section or screen title that a screen reader user can
 *   jump between with the rotor/heading navigation. Use on the visible title
 *   of a screen or a grouped section, not on body copy.
 * - **`button`** — anything that performs an action on activation (submit,
 *   toggle, open a sheet). Pair it with an `accessibilityLabel` describing the
 *   action, not the visual ("Delete item", not "trash icon").
 * - **`link`** — navigation that takes the user elsewhere (in-app route or an
 *   external URL). Reserve it for navigation; an in-place action is a `button`.
 * - **`alert`** — a message that demands attention as soon as it appears, such
 *   as a toast or an inline error. Render it with this role **and** announce
 *   its text through {@link announceForAccessibility} so it is spoken without
 *   the user having to move focus to it.
 */
export const A11Y_ROLES = {
  header: 'header',
  button: 'button',
  link: 'link',
  alert: 'alert',
} as const satisfies Record<string, AccessibilityRole>;

/** Convention key into {@link A11Y_ROLES} (e.g. `'header' | 'button' | …`). */
export type A11yRoleName = keyof typeof A11Y_ROLES;

/** The concrete `AccessibilityRole` value a convention resolves to. */
export type A11yRole = (typeof A11Y_ROLES)[A11yRoleName];
