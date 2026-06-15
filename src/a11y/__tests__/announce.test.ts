import { AccessibilityInfo } from 'react-native';

import { announceForAccessibility } from '../announce';

beforeEach(() => {
  // jest-expo pre-mocks AccessibilityInfo, so its call history persists across
  // tests; clear it before each so assertions only see this test's calls.
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('announceForAccessibility', () => {
  it('speaks a non-empty message immediately by default', () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});

    announceForAccessibility('Item deleted');

    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith('Item deleted');
  });

  it('ignores empty and whitespace-only messages', () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    const queued = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions')
      .mockImplementation(() => {});

    announceForAccessibility('');
    announceForAccessibility('   ');

    expect(announce).not.toHaveBeenCalled();
    expect(queued).not.toHaveBeenCalled();
  });

  it('uses the queued variant when queue is requested and available', () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    const queued = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions')
      .mockImplementation(() => {});

    announceForAccessibility('Saved', { queue: true });

    expect(queued).toHaveBeenCalledWith('Saved', { queue: true });
    expect(announce).not.toHaveBeenCalled();
  });

  it('falls back to the immediate API when the queued variant is unavailable', () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    // Simulate a runtime where the queued method does not exist.
    const original = AccessibilityInfo.announceForAccessibilityWithOptions;
    // @ts-expect-error — deliberately removing the optional method for the test.
    AccessibilityInfo.announceForAccessibilityWithOptions = undefined;

    announceForAccessibility('Saved', { queue: true });

    expect(announce).toHaveBeenCalledWith('Saved');

    AccessibilityInfo.announceForAccessibilityWithOptions = original;
  });

  it('uses the immediate API when queue is false', () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    const queued = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions')
      .mockImplementation(() => {});

    announceForAccessibility('Loaded', { queue: false });

    expect(announce).toHaveBeenCalledWith('Loaded');
    expect(queued).not.toHaveBeenCalled();
  });
});
