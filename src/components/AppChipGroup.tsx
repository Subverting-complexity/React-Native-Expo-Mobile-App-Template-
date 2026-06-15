import { useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { AppChip, type AppChipSize } from './AppChip';
import { useTheme } from '@/theme';

/** One selectable option in an {@link AppChipGroup}. */
export interface AppChipOption {
  /** Stable value reported through `onChange`. */
  value: string;
  /** Visible chip text. */
  label: string;
  disabled?: boolean;
}

interface BaseGroupProps {
  options: AppChipOption[];
  size?: AppChipSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

interface SingleSelectProps extends BaseGroupProps {
  multiple?: false;
  /** Currently selected value, or `null` when nothing is selected. */
  value: string | null;
  /** Fires with the new value; re-tapping the selected chip clears it (`null`). */
  onChange: (value: string | null) => void;
}

interface MultiSelectProps extends BaseGroupProps {
  multiple: true;
  /** Currently selected values. */
  values: string[];
  /** Fires with the next selection set whenever a chip is toggled. */
  onChange: (values: string[]) => void;
}

export type AppChipGroupProps = SingleSelectProps | MultiSelectProps;

function isSelected(props: AppChipGroupProps, value: string): boolean {
  return props.multiple ? props.values.includes(value) : props.value === value;
}

function nextSelection(props: AppChipGroupProps, value: string): void {
  if (props.multiple) {
    const set = props.values.includes(value)
      ? props.values.filter((v) => v !== value)
      : [...props.values, value];
    props.onChange(set);
    return;
  }
  // Single-select toggles: tapping the active chip clears the selection.
  props.onChange(props.value === value ? null : value);
}

/**
 * Theme-driven group of {@link AppChip}s for filtering. Single-select by
 * default (one value, re-tap to clear); pass `multiple` for a toggle set.
 * Selection state is fully controlled by the parent — the group holds none.
 * Layout (wrapping row, gap) reads from `useTheme()` spacing tokens.
 */
export function AppChipGroup(props: AppChipGroupProps) {
  const { options, size = 'md', style, testID } = props;
  const { theme } = useTheme();

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing[2],
    }),
    [theme],
  );

  return (
    <View style={[containerStyle, style]} testID={testID}>
      {options.map((option) => (
        <AppChip
          key={option.value}
          label={option.label}
          size={size}
          selected={isSelected(props, option.value)}
          disabled={option.disabled}
          onPress={() => nextSelection(props, option.value)}
        />
      ))}
    </View>
  );
}
