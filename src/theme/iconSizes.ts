/** Icon size tokens, in points. Pass one as an icon's `size`, never a number. */
export interface IconSizeScale {
  /** An icon in a small control, or beside small text. */
  sm: number;
  /** The default icon size. */
  md: number;
  /** An icon in a large control. */
  lg: number;
  /** A feature icon, such as the one on a placeholder screen. */
  xl: number;
}

export const iconSizes: IconSizeScale = {
  sm: 18,
  md: 24,
  lg: 30,
  xl: 40,
};
