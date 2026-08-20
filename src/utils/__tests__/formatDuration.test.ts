import { formatDuration } from '../formatDuration';

describe('formatDuration', () => {
  it('formats under an hour as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3599)).toBe('59:59');
  });

  it('widens to h:mm:ss at an hour', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(36_125)).toBe('10:02:05');
  });

  it('truncates fractional seconds', () => {
    expect(formatDuration(89.9)).toBe('1:29');
  });

  it('clamps invalid input to zero instead of rendering NaN', () => {
    expect(formatDuration(Number.NaN)).toBe('0:00');
    expect(formatDuration(-5)).toBe('0:00');
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('0:00');
  });
});
