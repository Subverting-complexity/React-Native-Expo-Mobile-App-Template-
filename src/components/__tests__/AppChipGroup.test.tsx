import { fireEvent } from '@testing-library/react-native';

import { AppChipGroup, type AppChipOption } from '../AppChipGroup';
import { renderWithTheme } from '@/test';

const OPTIONS: AppChipOption[] = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry', disabled: true },
];

describe('AppChipGroup', () => {
  it('renders a chip per option', () => {
    const { getByText } = renderWithTheme(
      <AppChipGroup options={OPTIONS} value={null} onChange={jest.fn()} />,
    );
    expect(getByText('Apple')).toBeTruthy();
    expect(getByText('Banana')).toBeTruthy();
    expect(getByText('Cherry')).toBeTruthy();
  });

  it('marks the active option selected in single-select mode', () => {
    const { getByLabelText } = renderWithTheme(
      <AppChipGroup options={OPTIONS} value="a" onChange={jest.fn()} />,
    );
    expect(getByLabelText('Apple').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(getByLabelText('Banana').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it('selects a value on tap in single-select mode', () => {
    const onChange = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <AppChipGroup options={OPTIONS} value={null} onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('Banana'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('clears the selection when the active chip is tapped again', () => {
    const onChange = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <AppChipGroup options={OPTIONS} value="a" onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('Apple'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('adds a value to the set in multi-select mode', () => {
    const onChange = jest.fn();
    const { getByLabelText } = renderWithTheme(
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

  it('removes an already-selected value in multi-select mode', () => {
    const onChange = jest.fn();
    const { getByLabelText } = renderWithTheme(
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

  it('does not fire for a disabled option', () => {
    const onChange = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <AppChipGroup options={OPTIONS} value={null} onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('Cherry'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
