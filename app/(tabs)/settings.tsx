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
import {
  COLOR_MODES,
  COLOR_MODE_LABELS,
  THEMES,
  THEME_NAMES,
  useTheme,
  type ColorMode,
  type ThemeName,
} from '@/theme';

const MODE_OPTIONS: AppChipOption<ColorMode>[] = COLOR_MODES.map((mode) => ({
  value: mode,
  label: COLOR_MODE_LABELS[mode],
}));

const THEME_OPTIONS: AppChipOption<ThemeName>[] = THEME_NAMES.map((name) => ({
  value: name,
  label: THEMES[name].label,
}));

/**
 * Settings tab. It owns no tokens or state of its own; it shows the app's
 * appearance and accessibility state through existing seams:
 *
 * - **Appearance**: light, dark or system. The choice applies at once (the
 *   whole tree re-skins through `useTheme()`) and the theme provider saves it.
 * - **Theme**: one entry per theme in `THEMES`. Hidden when there is only one.
 * - **Text size**: a live sample of OS font scaling, up to the central
 *   `MAX_FONT_SIZE_MULTIPLIER` cap. Font scale is an OS preference, not app
 *   state, so there is no in-app slider.
 * - **Motion**: mirrors the OS reduce-motion preference.
 *
 * The tab header shows the title.
 */
export default function SettingsScreen() {
  const { theme, colorMode, setColorMode, themeName, setThemeName } =
    useTheme();
  const { reduceMotion } = useA11y();
  const { fontScale } = useWindowDimensions();
  const reduceMotionLabel = reduceMotion ? 'On' : 'Off';

  const onSelectMode = (value: ColorMode) => {
    setColorMode(value);
    announceForAccessibility(`Appearance set to ${COLOR_MODE_LABELS[value]}`);
  };

  const onSelectTheme = (value: ThemeName) => {
    setThemeName(value);
    announceForAccessibility(`Theme set to ${THEMES[value].label}`);
  };

  return (
    <AppScreenContainer
      scroll
      edges={['left', 'right']}
      testID="settings-screen"
    >
      <View style={{ gap: theme.spacing[6] }}>
        <AppSection
          title="Appearance"
          description="Choose light or dark colours. System follows your device. Your choice applies at once and is saved."
          testID="settings-appearance"
        >
          <AppChipGroup
            required
            options={MODE_OPTIONS}
            value={colorMode}
            onChange={onSelectMode}
            accessibilityLabel="Appearance"
            testID="theme-mode-group"
          />
        </AppSection>

        {THEME_OPTIONS.length > 1 ? (
          <AppSection title="Theme" testID="settings-theme">
            <AppChipGroup
              required
              options={THEME_OPTIONS}
              value={themeName}
              onChange={onSelectTheme}
              accessibilityLabel="Theme"
              testID="theme-group"
            />
          </AppSection>
        ) : null}

        <AppSection
          title="Text size"
          description="Text follows the text size in your device settings. Change it to see this sample grow, up to the app's limit."
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
          description="Follows the reduce motion setting on your device. When it is on, the app keeps animations short or skips them."
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
