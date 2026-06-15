import type { AccessibilityRole } from 'react-native';

import { A11Y_ROLES, type A11yRole, type A11yRoleName } from '../roles';

describe('A11Y_ROLES', () => {
  it('defines the conventions called out by the a11y foundation', () => {
    expect(A11Y_ROLES).toEqual({
      header: 'header',
      button: 'button',
      link: 'link',
      alert: 'alert',
    });
  });

  it('resolves every convention to a valid AccessibilityRole', () => {
    // Compile-time guarantee surfaced at runtime: each value is assignable to
    // React Native's AccessibilityRole union.
    const roles: AccessibilityRole[] = Object.values(A11Y_ROLES);
    expect(roles).toHaveLength(4);
    roles.forEach((role) => expect(typeof role).toBe('string'));
  });

  it('exposes the role-name and role-value types', () => {
    const name: A11yRoleName = 'button';
    const value: A11yRole = A11Y_ROLES[name];
    expect(value).toBe('button');
  });
});
