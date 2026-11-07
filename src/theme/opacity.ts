/**
 * Opacity tokens for interaction states and decorative fades. Components read
 * these through `useTheme()`, so a change to how "disabled" or "pressed" looks
 * is one edit here, not one edit in each component.
 */
export interface OpacityScale {
  /** A disabled control. */
  disabled: number;
  /** A filled control (button, chip, icon button) while it is pressed. */
  pressed: number;
  /** A text-only control (link, back button) while it is pressed. Stronger, so the change shows on text. */
  pressedText: number;
  /** Decorative content that must look secondary, such as a preview sketch. */
  faded: number;
}

export const opacity: OpacityScale = {
  disabled: 0.5,
  pressed: 0.85,
  pressedText: 0.7,
  faded: 0.7,
};
