import { AccessibilityInfo } from 'react-native';
import { renderHook, act, waitFor } from '@testing-library/react-native';

import { useReduceMotionDetection } from '../reduceMotionDetection';

type ReduceMotionHandler = (enabled: boolean) => void;

function mockAccessibility(initial: boolean) {
  const remove = jest.fn();
  let handler: ReduceMotionHandler = () => {};

  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(initial);
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation((event, cb) => {
      if (event === 'reduceMotionChanged') {
        handler = cb as ReduceMotionHandler;
      }
      return { remove } as ReturnType<
        typeof AccessibilityInfo.addEventListener
      >;
    });

  return { remove, emit: (value: boolean) => act(() => handler(value)) };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useReduceMotionDetection', () => {
  it('starts false then adopts the initial OS value', async () => {
    mockAccessibility(true);
    const { result } = renderHook(() => useReduceMotionDetection());

    expect(result.current).toBe(false);
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('updates when the OS preference changes', async () => {
    const { emit } = mockAccessibility(false);
    const { result } = renderHook(() => useReduceMotionDetection());

    await waitFor(() => expect(result.current).toBe(false));
    emit(true);
    expect(result.current).toBe(true);
  });

  it('removes the subscription on unmount', async () => {
    const { remove } = mockAccessibility(false);
    const { unmount } = renderHook(() => useReduceMotionDetection());

    await waitFor(() =>
      expect(AccessibilityInfo.addEventListener).toHaveBeenCalled(),
    );
    unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('stays false when the OS query rejects', async () => {
    const remove = jest.fn();
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockRejectedValue(new Error('unsupported'));
    jest
      .spyOn(AccessibilityInfo, 'addEventListener')
      .mockReturnValue({ remove } as ReturnType<
        typeof AccessibilityInfo.addEventListener
      >);

    const { result } = renderHook(() => useReduceMotionDetection());

    await waitFor(() =>
      expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled(),
    );
    expect(result.current).toBe(false);
  });
});
