import { Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { AppEmptyState } from '../AppEmptyState';
import { renderWithTheme } from '@/test';

describe('AppEmptyState', () => {
  it('renders the title and subtitle', () => {
    const { getByText } = renderWithTheme(
      <AppEmptyState title="No items yet" subtitle="Add your first one" />,
    );
    expect(getByText('No items yet')).toBeTruthy();
    expect(getByText('Add your first one')).toBeTruthy();
  });

  it('renders an optional icon slot', () => {
    const { getByText } = renderWithTheme(
      <AppEmptyState title="Empty" icon={<Text>ICON</Text>} />,
    );
    expect(getByText('ICON')).toBeTruthy();
  });

  it('renders no action button without both label and handler', () => {
    const { queryByRole } = renderWithTheme(
      <AppEmptyState title="Empty" actionLabel="Add" />,
    );
    expect(queryByRole('button')).toBeNull();
  });

  it('renders the action button and fires its handler', () => {
    const onAction = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <AppEmptyState
        title="Empty"
        actionLabel="Add item"
        onAction={onAction}
      />,
    );
    const button = getByLabelText('Add item');
    expect(button.props.accessibilityRole).toBe('button');
    fireEvent.press(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
