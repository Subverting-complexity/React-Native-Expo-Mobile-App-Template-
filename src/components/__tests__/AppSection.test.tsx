import { Text } from 'react-native';

import { AppSection } from '../AppSection';
import { renderWithTheme } from '@/test';

describe('AppSection', () => {
  it('renders its children', async () => {
    const { getByText } = await renderWithTheme(
      <AppSection>
        <Text>Body</Text>
      </AppSection>,
    );
    expect(getByText('Body')).toBeTruthy();
  });

  it('renders the title with the header accessibility role', async () => {
    const { getByText } = await renderWithTheme(<AppSection title="Account" />);
    const title = getByText('Account');
    expect(title.props.accessibilityRole).toBe('header');
  });

  it('renders an optional description', async () => {
    const { getByText } = await renderWithTheme(
      <AppSection title="Account" description="Manage your details" />,
    );
    expect(getByText('Manage your details')).toBeTruthy();
  });

  it('omits the header when neither title nor description is given', async () => {
    const { queryByRole } = await renderWithTheme(
      <AppSection>
        <Text>Only body</Text>
      </AppSection>,
    );
    expect(queryByRole('header')).toBeNull();
  });
});
