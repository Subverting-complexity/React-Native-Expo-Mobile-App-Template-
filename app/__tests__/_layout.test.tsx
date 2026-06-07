import { render } from '@testing-library/react-native';
import RootLayout from '../_layout';

jest.mock('expo-router', () => ({
  Stack: () => null,
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));

describe('RootLayout', () => {
  it('renders without crashing', () => {
    render(<RootLayout />);
  });
});
