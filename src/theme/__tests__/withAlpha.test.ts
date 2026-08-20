import { withAlpha } from '../withAlpha';

describe('withAlpha', () => {
  it('appends the alpha byte to a #RRGGBB token', () => {
    expect(withAlpha('#4263EB', 0.5)).toBe('#4263EB80');
    expect(withAlpha('#4263EB', 1)).toBe('#4263EBff');
    expect(withAlpha('#4263EB', 0)).toBe('#4263EB00');
  });

  it('expands #RGB shorthand before appending', () => {
    expect(withAlpha('#fff', 1)).toBe('#ffffffff');
  });

  it('clamps alpha into [0, 1]', () => {
    expect(withAlpha('#000000', -1)).toBe('#00000000');
    expect(withAlpha('#000000', 2)).toBe('#000000ff');
  });

  it('throws on anything that is not a solid hex token', () => {
    // Loudly, so a malformed token is caught at the call site instead of
    // silently painting the wrong color.
    expect(() => withAlpha('red', 0.5)).toThrow();
    expect(() => withAlpha('#4263EB80', 0.5)).toThrow();
    expect(() => withAlpha('rgba(0,0,0,0.5)', 0.5)).toThrow();
  });
});
