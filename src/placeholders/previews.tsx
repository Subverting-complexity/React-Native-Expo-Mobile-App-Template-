import { View, type DimensionValue } from 'react-native';

import { useTheme, withAlpha } from '@/theme';

/** A rounded bar that stands in for a line of text. */
export function SkeletonLine({
  width,
  color,
}: {
  width: DimensionValue;
  color?: string;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        width,
        height: theme.spacing[2],
        borderRadius: theme.radii.full,
        backgroundColor: color ?? theme.colors.surfaceVariant,
      }}
    />
  );
}

// The status colour token of each row, fixed so the sketch looks the same every time.
const STATUSES: ('success' | 'warning' | 'error' | 'info')[] = [
  'success',
  'info',
  'warning',
  'success',
];

/**
 * List rows: a status dot, two lines of text and a status pill. A starting
 * point for a placeholder preview; copy it and change it to sketch the real
 * screen.
 */
export function ListPreview() {
  const { theme } = useTheme();
  const { colors, spacing, radii } = theme;

  return (
    <View style={{ gap: spacing[3] }}>
      {STATUSES.map((status, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[3],
            padding: spacing[3],
            borderRadius: radii.lg,
            backgroundColor: colors.background,
          }}
        >
          <View
            style={{
              width: spacing[3],
              height: spacing[3],
              borderRadius: radii.full,
              backgroundColor: colors[status],
            }}
          />
          <View style={{ flex: 1, gap: spacing[2] }}>
            <SkeletonLine width={index % 2 === 0 ? '70%' : '55%'} />
            <SkeletonLine width="35%" />
          </View>
          <View
            style={{
              width: spacing[12],
              height: spacing[5],
              borderRadius: radii.full,
              backgroundColor: withAlpha(colors[status], 0.25),
            }}
          />
        </View>
      ))}
    </View>
  );
}
