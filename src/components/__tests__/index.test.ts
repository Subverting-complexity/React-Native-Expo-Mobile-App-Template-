import * as components from '../index';

/**
 * Guard for the public component barrel (#29). Every `App*` component must
 * be reachable from the single `@/components` import path. If a component
 * file is added without a matching `export *` line in `index.ts`, this
 * fails — keeping the "single import path works app-wide" acceptance honest.
 */
const EXPECTED_COMPONENTS = [
  'AppBackButton',
  'AppBadge',
  'AppButton',
  'AppCard',
  'AppChip',
  'AppChipGroup',
  'AppEmptyState',
  'AppIconButton',
  'AppLinkButton',
  'AppListItem',
  'AppPressable',
  'AppScreenContainer',
  'AppSection',
  'AppText',
  'AppTextInput',
] as const;

describe('components barrel', () => {
  it.each(EXPECTED_COMPONENTS)('re-exports %s as a component', (name) => {
    expect(typeof (components as Record<string, unknown>)[name]).toBe(
      'function',
    );
  });
});
