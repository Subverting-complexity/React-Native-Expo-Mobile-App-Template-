import { useState } from 'react';
import { View } from 'react-native';

import { GalleryRow, GalleryStack, noop } from '../layout';
import {
  AppBadge,
  AppButton,
  AppLoadingScreen,
  AppProgressBar,
  AppSection,
  AppSpinner,
  AppText,
  useToast,
} from '@/components';
import type {
  AppBadgeTone,
  AppBadgeVariant,
  AppProgressTone,
  AppSpinnerSize,
  AppSpinnerTone,
  ToastTone,
} from '@/components';
import { useTheme } from '@/theme';

const BADGE_VARIANTS: AppBadgeVariant[] = ['solid', 'soft', 'outline'];
const BADGE_TONES: AppBadgeTone[] = [
  'neutral',
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
];

const PROGRESS_TONES: AppProgressTone[] = [
  'primary',
  'success',
  'warning',
  'error',
];
const SPINNER_SIZES: AppSpinnerSize[] = ['sm', 'lg'];
const SPINNER_TONES: AppSpinnerTone[] = ['primary', 'secondary', 'muted'];
const TOAST_TONES: ToastTone[] = ['info', 'success', 'warning', 'error'];

const PROGRESS_STEP = 0.2;

/**
 * Showcases the feedback components — `AppBadge` (tone × variant matrix),
 * `AppProgressBar` (live value control), `AppSpinner`, `AppLoadingScreen`, and
 * toasts driven through `useToast`. Pressing the progress buttons moves the bar;
 * the toast buttons raise a real toast through the provider.
 */
export function FeedbackSection() {
  const { theme } = useTheme();
  const { show } = useToast();
  const [progress, setProgress] = useState(0.4);

  const stepProgress = (delta: number) =>
    setProgress((value) => Math.min(1, Math.max(0, value + delta)));

  return (
    <AppSection
      title="Feedback"
      description="AppBadge, AppProgressBar, AppSpinner, AppLoadingScreen, and toasts."
    >
      <GalleryStack>
        <AppText variant="label">Badges</AppText>
        {BADGE_VARIANTS.map((variant) => (
          <GalleryRow key={variant}>
            {BADGE_TONES.map((tone) => (
              <AppBadge key={tone} label={tone} variant={variant} tone={tone} />
            ))}
          </GalleryRow>
        ))}

        <AppText variant="label">
          Progress ({Math.round(progress * 100)}%)
        </AppText>
        <AppProgressBar value={progress} accessibilityLabel="Demo progress" />
        <GalleryRow>
          <AppButton
            label="Less"
            size="sm"
            variant="outline"
            onPress={() => stepProgress(-PROGRESS_STEP)}
          />
          <AppButton
            label="More"
            size="sm"
            variant="outline"
            onPress={() => stepProgress(PROGRESS_STEP)}
          />
        </GalleryRow>
        {PROGRESS_TONES.map((tone) => (
          <AppProgressBar
            key={tone}
            value={0.6}
            tone={tone}
            accessibilityLabel={`${tone} progress`}
          />
        ))}

        <AppText variant="label">Spinners</AppText>
        <GalleryRow>
          {SPINNER_SIZES.map((size) => (
            <AppSpinner key={size} size={size} />
          ))}
          {SPINNER_TONES.map((tone) => (
            <AppSpinner key={tone} tone={tone} />
          ))}
        </GalleryRow>

        <AppText variant="label">Loading screen</AppText>
        <View
          style={{
            height: theme.spacing[24],
            borderRadius: theme.radii.md,
            overflow: 'hidden',
          }}
        >
          <AppLoadingScreen message="Loading…" />
        </View>

        <AppText variant="label">Toasts</AppText>
        <GalleryRow>
          {TOAST_TONES.map((tone) => (
            <AppButton
              key={tone}
              label={tone}
              size="sm"
              variant="secondary"
              onPress={() => show(`${tone} toast`, { tone })}
            />
          ))}
          <AppButton
            label="with action"
            size="sm"
            onPress={() =>
              show('Item archived', {
                tone: 'success',
                action: { label: 'Undo', onPress: noop },
              })
            }
          />
        </GalleryRow>
      </GalleryStack>
    </AppSection>
  );
}
