import { useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { AppChip, type AppChipSize } from './AppChip';
import { useTheme } from '@/theme';
import { A11Y_ROLES } from '@/a11y';

/** One selectable option in an {@link AppChipGroup}. */
export interface AppChipOption<T extends string = string> {
  /** Stable value reported through `onChange`. */
  value: T;
  /** Visible chip text. */
  label: string;
  disabled?: boolean;
}

interface BaseGroupProps<T extends string> {
  options: AppChipOption<T>[];
  size?: AppChipSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

interface SingleSelectProps<T extends string> extends BaseGroupProps<T> {
  multiple?: false;
  required?: false;
  /** Spoken name of the radio group, such as the section title. */
  accessibilityLabel?: string;
  /** Currently selected value, or `null` when nothing is selected. */
  value: T | null;
  /** Fires with the new value; re-tapping the selected chip clears it (`null`). */
  onChange: (value: T | null) => void;
}

/**
 * A single choice that must always be set, such as a setting. Re-tapping the
 * selected chip does nothing, as with a standard radio group.
 */
interface RequiredSingleSelectProps<
  T extends string,
> extends BaseGroupProps<T> {
  multiple?: false;
  required: true;
  /** Spoken name of the radio group, such as the section title. */
  accessibilityLabel?: string;
  value: T;
  onChange: (value: T) => void;
}

interface MultiSelectProps<T extends string> extends BaseGroupProps<T> {
  multiple: true;
  /** Currently selected values. */
  values: T[];
  /** Fires with the next selection set whenever a chip is toggled. */
  onChange: (values: T[]) => void;
}

export type AppChipGroupProps<T extends string = string> =
  | SingleSelectProps<T>
  | RequiredSingleSelectProps<T>
  | MultiSelectProps<T>;

function isSelected<T extends string>(
  props: AppChipGroupProps<T>,
  value: T,
): boolean {
  return props.multiple ? props.values.includes(value) : props.value === value;
}

function nextSelection<T extends string>(
  props: AppChipGroupProps<T>,
  value: T,
): void {
  if (props.multiple) {
    const set = props.values.includes(value)
      ? props.values.filter((v) => v !== value)
      : [...props.values, value];
    props.onChange(set);
    return;
  }
  if (props.required) {
    if (props.value !== value) {
      props.onChange(value);
    }
    return;
  }
  // Single-select toggles: tapping the active chip clears the selection.
  props.onChange(props.value === value ? null : value);
}

/**
 * Theme-driven group of {@link AppChip}s for filtering. Single-select by
 * default (one value, re-tap to clear), announced as a radio group; pass
 * `required` when a value must always be set, or `multiple` for a toggle set. Selection state is fully controlled by the
 * parent — the group holds none. Layout (wrapping row, gap) reads from
 * `useTheme()` spacing tokens.
 */
export function AppChipGroup<T extends string>(props: AppChipGroupProps<T>) {
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
    <View
      style={[containerStyle, style]}
      testID={testID}
      accessibilityRole={props.multiple ? undefined : A11Y_ROLES.radiogroup}
      accessibilityLabel={props.multiple ? undefined : props.accessibilityLabel}
    >
      {options.map((option) => (
        <AppChip
          key={option.value}
          label={option.label}
          size={size}
          accessibilityRole={
            props.multiple ? A11Y_ROLES.button : A11Y_ROLES.radio
          }
          selected={isSelected(props, option.value)}
          disabled={option.disabled}
          onPress={() => nextSelection(props, option.value)}
        />
      ))}
    </View>
  );
}
