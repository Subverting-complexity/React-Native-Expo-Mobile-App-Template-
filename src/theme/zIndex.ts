export interface ZIndexScale {
  base: number;
  raised: number;
  dropdown: number;
  sticky: number;
  overlay: number;
  modal: number;
  toast: number;
}

export const zIndex: ZIndexScale = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
};
