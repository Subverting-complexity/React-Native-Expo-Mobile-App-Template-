import { render } from '@testing-library/react-native';
import RootLayout from '../_layout';

jest.mock('expo-router', () => ({
  Stack: () => null,
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

describe('RootLayout', () => {
  it('renders without crashing', () => {
    render(<RootLayout />);
  });
});
