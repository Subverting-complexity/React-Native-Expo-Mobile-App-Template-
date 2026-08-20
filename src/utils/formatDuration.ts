/**
 * Clock-style duration formatting for labels and accessibility values.
 *
 * `m:ss` for anything under an hour, widening to `h:mm:ss` at and beyond it —
 * the format users read off every media player. NaN, Infinity, and negative
 * inputs clamp to zero rather than rendering "NaN:NaN" into the UI, because
 * a duration is usually derived state and the moment it is briefly invalid
 * (asset still loading, division by a zero total) is exactly the moment it
 * is on screen.
 */
export function formatDuration(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const whole = Math.floor(safe);

  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const seconds = whole % 60;

  const two = (value: number) => String(value).padStart(2, '0');

  return hours > 0
    ? `${hours}:${two(minutes)}:${two(seconds)}`
    : `${minutes}:${two(seconds)}`;
}
