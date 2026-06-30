import { AccessibilityInfo } from 'react-native';
import { act } from '@testing-library/react-native';

export function mockReduceMotion(enabled: boolean) {
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(enabled);
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockReturnValue({ remove: jest.fn() } as ReturnType<
      typeof AccessibilityInfo.addEventListener
    >);
}

type ReduceMotionHandler = (enabled: boolean) => void;

export function mockAccessibility(initial: boolean) {
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
