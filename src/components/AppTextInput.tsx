import { useMemo, useState } from 'react';
import {
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { AppText } from './AppText';
import { MAX_FONT_SIZE_MULTIPLIER } from '@/a11y';
import { useTheme } from '@/theme';
import type { ThemeTokens } from '@/theme';

/**
 * Props for {@link AppTextInput}.
 *
 * Extends React Native's `TextInput` so every standard prop (`value`,
 * `onChangeText`, `keyboardType`, `secureTextEntry`, …) passes through, but
 * replaces `style` with the split `containerStyle` / `inputStyle` pair so the
 * wrapper and the field can be targeted independently. A visible `label` is
 * required and doubles as the default screen-reader name, so a field is never
 * shipped unannounced.
 */
export interface AppTextInputProps
  extends Omit<TextInputProps, 'style' | 'accessibilityLabel'> {
  /** Visible field label and default screen-reader name. */
  label: string;
  /** Optional helper text shown below the field when there is no error. */
  hint?: string;
  /** When set, the field renders in its error state and shows this message. */
  errorText?: string;
  /** Override the spoken name when it should differ from `label`. */
  accessibilityLabel?: string;
  /** Style for the outer wrapper (label + field + helper). */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style for the `TextInput` itself. */
  inputStyle?: StyleProp<TextStyle>;
  /** Optional test/automation id applied to the `TextInput`. */
  testID?: string;
}

/** Resolves the field border colour for the current state. */
function borderColorFor(
  theme: ThemeTokens,
  hasError: boolean,
  focused: boolean,
  isDisabled: boolean,
): string {
  if (hasError) return theme.colors.error;
  if (focused) return theme.colors.primary;
  if (isDisabled) return theme.colors.borderSubtle;
  return theme.colors.border;
}

/**
 * Themed, accessible text field. Composes a {@link AppText} label, a tokenized
 * `TextInput`, and an {@link AppText} helper/error line. Every colour, spacing,
 * radius, and type value comes from `useTheme()` tokens — nothing is hardcoded.
 *
 * The border highlights with the primary colour on focus and the error colour
 * when `errorText` is set. The helper line shows `errorText` (error tone) when
 * present, otherwise `hint` (secondary tone). The field's `accessibilityHint`
 * mirrors that same precedence so screen-reader users hear the error or hint.
 */
export function AppTextInput({
  label,
  hint,
  errorText,
  accessibilityLabel,
  editable = true,
  allowFontScaling = true,
  maxFontSizeMultiplier = MAX_FONT_SIZE_MULTIPLIER,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  testID,
  ...rest
}: AppTextInputProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const hasError = errorText != null && errorText.length > 0;
  const isDisabled = editable === false;
  const helperText = hasError ? errorText : hint;

  const fieldStyle = useMemo<TextStyle>(
    () => ({
      borderWidth: 1,
      borderColor: borderColorFor(theme, hasError, focused, isDisabled),
      borderRadius: theme.radii.md,
      backgroundColor: isDisabled
        ? theme.colors.surfaceVariant
        : theme.colors.surface,
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[4],
      color: isDisabled ? theme.colors.textDisabled : theme.colors.textPrimary,
      fontFamily: theme.typography.families.sans,
      fontSize: theme.typography.sizes.md.fontSize,
      lineHeight: theme.typography.sizes.md.lineHeight,
      minHeight: theme.a11y.minTouchTarget,
    }),
    [theme, hasError, focused, isDisabled],
  );

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur: NonNullable<TextInputProps['onBlur']> = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[{ gap: theme.spacing[2] }, containerStyle]}>
      <AppText variant="label" tone={isDisabled ? 'disabled' : 'primary'}>
        {label}
      </AppText>
      <TextInput
        style={[fieldStyle, inputStyle]}
        editable={editable}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={helperText}
        accessibilityState={{ disabled: isDisabled }}
        placeholderTextColor={theme.colors.textDisabled}
        allowFontScaling={allowFontScaling}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        onFocus={handleFocus}
        onBlur={handleBlur}
        testID={testID}
        {...rest}
      />
      {helperText ? (
        <AppText variant="caption" tone={hasError ? 'error' : 'secondary'}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}
