import { AccessibilityInfo } from 'react-native';

/** Options for {@link announceForAccessibility}. */
export interface AnnounceOptions {
  /**
   * iOS only. When `true`, the announcement is queued behind any speech the
   * screen reader is currently making instead of interrupting it. Ignored on
   * platforms where the queued API is unavailable, where the announcement is
   * made immediately.
   */
  queue?: boolean;
}

/**
 * Speaks a message through the active screen reader (VoiceOver / TalkBack).
 *
 * This is the single entry point for programmatic announcements — components
 * and screen flows call this rather than touching `AccessibilityInfo`
 * directly, so the empty-message guard and the iOS queue handling live in one
 * place. Use it for events that change state without moving focus: a toast
 * appearing (paired with `accessibilityRole="alert"`), a filter applied, a row
 * removed, an async action finishing.
 *
 * Blank or whitespace-only messages are ignored so a missing string never
 * triggers a spurious or silent announcement.
 *
 * @param message Text to speak. No-op when empty or whitespace-only.
 * @param options See {@link AnnounceOptions}.
 */
export function announceForAccessibility(
  message: string,
  options?: AnnounceOptions,
): void {
  if (message.trim().length === 0) {
    return;
  }

  // The queued variant is iOS-only and may be absent on other platforms or
  // older runtimes; fall back to the immediate announcement when it is not a
  // callable method so a caller asking to queue never throws.
  if (
    options?.queue === true &&
    typeof AccessibilityInfo.announceForAccessibilityWithOptions === 'function'
  ) {
    AccessibilityInfo.announceForAccessibilityWithOptions(message, {
      queue: true,
    });
    return;
  }

  AccessibilityInfo.announceForAccessibility(message);
}
