import { render } from '@testing-library/react-native';
import HomeScreen from '../index';
import { ThemeProvider } from '@/theme';

const storage = {
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider storage={storage}>{children}</ThemeProvider>;
}

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    render(<HomeScreen />, { wrapper: Wrapper });
  });

  it('displays the template label', () => {
    const { getByText } = render(<HomeScreen />, { wrapper: Wrapper });
    getByText('Expo Template');
  });
});
