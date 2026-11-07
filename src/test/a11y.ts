import { AccessibilityInfo, type EmitterSubscription } from 'react-native';
import { act } from '@testing-library/react-native';

// The code under test only calls `remove`, so a partial subscription is enough.
function fakeSubscription(remove: () => void): EmitterSubscription {
  return { remove } as unknown as EmitterSubscription;
}

export function mockReduceMotion(enabled: boolean) {
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(enabled);
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockReturnValue(fakeSubscription(jest.fn()));
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
    .mockImplementation((event: string, cb: unknown) => {
      if (event === 'reduceMotionChanged') {
        handler = cb as ReduceMotionHandler;
      }
      return fakeSubscription(remove);
    });

  return { remove, emit: (value: boolean) => act(() => handler(value)) };
}
