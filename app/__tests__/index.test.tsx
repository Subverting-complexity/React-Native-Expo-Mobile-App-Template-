import { render } from '@testing-library/react-native';
import HomeScreen from '../index';

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    render(<HomeScreen />);
  });

  it('displays the template label', () => {
    const { getByText } = render(<HomeScreen />);
    getByText('Expo Template');
  });
});
