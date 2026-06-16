import { useState } from 'react';

import { GalleryStack } from '../layout';
import { AppSection, AppTextInput } from '@/components';

/**
 * Showcases `AppTextInput`: a labelled field with a hint, a live error state, and
 * a read-only field. Typing an address without an `@` flips the email field into
 * its error state so the error styling and helper precedence are visible.
 */
export function FormsSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const emailError =
    email.length > 0 && !email.includes('@')
      ? 'Enter a valid email address.'
      : undefined;

  return (
    <AppSection
      title="Forms"
      description="AppTextInput — label, hint, error, and read-only states."
    >
      <GalleryStack>
        <AppTextInput
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Ada Lovelace"
          hint="Your full name."
        />
        <AppTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          errorText={emailError}
        />
        <AppTextInput label="Read-only" value="Not editable" editable={false} />
      </GalleryStack>
    </AppSection>
  );
}
