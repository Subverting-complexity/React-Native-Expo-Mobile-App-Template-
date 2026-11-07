import { fireEvent } from '@testing-library/react-native';

import { AppChipGroup, type AppChipOption } from '../AppChipGroup';
import { renderWithTheme } from '@/test';

const OPTIONS: AppChipOption[] = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry', disabled: true },
];

describe('AppChipGroup', () => {
  it('renders a chip per option', async () => {
    const { getByText } = await renderWithTheme(
      <AppChipGroup options={OPTIONS} value={null} onChange={jest.fn()} />,
    );
    expect(getByText('Apple')).toBeTruthy();
    expect(getByText('Banana')).toBeTruthy();
    expect(getByText('Cherry')).toBeTruthy();
  });

  it('announces a single-select group as a labelled radio group', async () => {
    const { getByRole, getByTestId } = await renderWithTheme(
      <AppChipGroup
        options={OPTIONS}
        value="a"
        onChange={jest.fn()}
        accessibilityLabel="Fruit"
        testID="fruit"
      />,
    );
    expect(getByTestId('fruit').props).toMatchObject({
      accessibilityRole: 'radiogroup',
      accessibilityLabel: 'Fruit',
    });
    getByRole('radio', { name: 'Apple' });
  });

  it('marks the active option checked in single-select mode', async () => {
    const { getByLabelText } = await renderWithTheme(
      <AppChipGroup options={OPTIONS} value="a" onChange={jest.fn()} />,
    );
    expect(getByLabelText('Apple').props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );
    expect(getByLabelText('Banana').props.accessibilityState).toEqual(
      expect.objectContaining({ checked: false }),
    );
  });

  it('keeps multi-select chips as buttons with a selected state', async () => {
    const { getByRole } = await renderWithTheme(
      <AppChipGroup
        options={OPTIONS}
        multiple
        values={['a']}
        onChange={jest.fn()}
      />,
    );
    expect(
      getByRole('button', { name: 'Apple' }).props.accessibilityState,
    ).toEqual(expect.objectContaining({ selected: true }));
  });

  it('selects a value on tap in single-select mode', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <AppChipGroup options={OPTIONS} value={null} onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('Banana'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('clears the selection when the active chip is tapped again', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <AppChipGroup options={OPTIONS} value="a" onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('Apple'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('keeps a required selection when the active chip is tapped again', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <AppChipGroup required options={OPTIONS} value="a" onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('Apple'));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.press(getByLabelText('Banana'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('adds a value to the set in multi-select mode', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <AppChipGroup
        options={OPTIONS}
        multiple
        values={['a']}
        onChange={onChange}
      />,
    );
    fireEvent.press(getByLabelText('Banana'));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('removes an already-selected value in multi-select mode', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <AppChipGroup
        options={OPTIONS}
        multiple
        values={['a', 'b']}
        onChange={onChange}
      />,
    );
    fireEvent.press(getByLabelText('Apple'));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('does not fire for a disabled option', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <AppChipGroup options={OPTIONS} value={null} onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('Cherry'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
