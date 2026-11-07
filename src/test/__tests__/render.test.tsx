import { Text } from 'react-native';
import { screen } from '@testing-library/react-native';

import { useApi, type ApiClient } from '@/api';
import { renderWithProviders } from '../render';

function ApiProbe({ expected }: { expected: ApiClient }) {
  return <Text>{useApi() === expected ? 'fake client' : 'other client'}</Text>;
}

describe('renderWithProviders', () => {
  it('provides the api client it is given to useApi', async () => {
    const api: ApiClient = { get: jest.fn(), post: jest.fn() };

    await renderWithProviders(<ApiProbe expected={api} />, { api });
    expect(screen.getByText('fake client')).toBeTruthy();
  });
});
