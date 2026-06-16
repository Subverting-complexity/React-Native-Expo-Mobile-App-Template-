import { useWindowDimensions, View } from 'react-native';

import {
  AppBadge,
  AppChipGroup,
  AppScreenContainer,
  AppSection,
  AppText,
  type AppChipOption,
} from '@/components';
import {
  MAX_FONT_SIZE_MULTIPLIER,
  announceForAccessibility,
  useA11y,
} from '@/a11y';
import { useTheme, type ColorMode } from '@/theme';

/**
 * Selectable colour-mode options. `value` matches the {@link ColorMode} union
 * the theme context understands; the visible `label` is what the user taps and
 * what a screen reader announces.
 */
const MODE_OPTIONS: AppChipOption[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

function modeLabel(mode: ColorMode): string {
  return MODE_OPTIONS.find((option) => option.value === mode)?.label ?? mode;
}

/**
 * Settings tab. Surfaces the app's appearance and accessibility state through
 * existing seams — it owns no tokens or state of its own:
 *
 * - **Appearance**: a single-select theme-mode group bound to the theme
 *   context. Selecting a mode applies it immediately (the whole tree re-skins
 *   through `useTheme()`) and persists it (the provider writes the choice to
 *   storage), satisfying the "reflect live and persist" acceptance criterion.
 * - **Text size**: a live demonstration of OS font scaling. The cap is the
 *   single-source `MAX_FONT_SIZE_MULTIPLIER`; the sample text scales with the
 *   device setting because `AppText` honours `fontScale`. There is no in-app
 *   slider — font scale is an OS preference, capped centrally, not app state.
 * - **Motion**: an indicator that mirrors the OS reduce-motion preference.
 */
export default function SettingsScreen() {
  const { theme, colorMode, setColorMode } = useTheme();
  const { reduceMotion } = useA11y();
  const { fontScale } = useWindowDimensions();

  const onSelectMode = (value: string | null) => {
    // A single-select group clears on re-tap, but a colour mode must always be
    // set — so ignore the clear and keep the current selection.
    if (value === null) {
      return;
    }
    const mode = value as ColorMode;
    setColorMode(mode);
    announceForAccessibility(`Theme set to ${modeLabel(mode)}`);
  };

  const reduceMotionLabel = reduceMotion ? 'On' : 'Off';

  return (
    <AppScreenContainer scroll testID="settings-screen">
      <View style={{ gap: theme.spacing[6] }}>
        <AppText variant="title" accessibilityRole="header">
          Settings
        </AppText>

        <AppSection
          title="Appearance"
          description="Choose how the app picks light or dark colours. System follows your device. Your choice applies immediately and is saved for next time."
          testID="settings-appearance"
        >
          <AppChipGroup
            options={MODE_OPTIONS}
            value={colorMode}
            onChange={onSelectMode}
            testID="theme-mode-group"
          />
        </AppSection>

        <AppSection
          title="Text size"
          description="Text follows your device display and accessibility settings. Change the system text size to see this sample grow, up to the app's cap."
          testID="settings-text-size"
        >
          <View style={{ gap: theme.spacing[2] }}>
            <AppText variant="bodySmall" tone="secondary">
              Current scale: {fontScale.toFixed(2)}× (max{' '}
              {MAX_FONT_SIZE_MULTIPLIER.toFixed(2)}×)
            </AppText>
            <AppText variant="body" testID="font-scale-sample">
              The quick brown fox jumps over the lazy dog.
            </AppText>
          </View>
        </AppSection>

        <AppSection
          title="Motion"
          description="Mirrors your device's reduce-motion setting. When on, the app keeps animations short or skips them."
          testID="settings-motion"
        >
          <AppBadge
            label={reduceMotionLabel}
            tone={reduceMotion ? 'success' : 'neutral'}
            accessibilityLabel={`Reduce motion: ${reduceMotionLabel}`}
            testID="reduce-motion-indicator"
          />
        </AppSection>
      </View>
    </AppScreenContainer>
  );
}
