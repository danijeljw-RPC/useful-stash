import assert from 'node:assert/strict';
import test from 'node:test';

import { validateSubmission } from '../src/lib/submissions/validation.ts';

test('media enquiry trims fields and requires contact permission', () => {
  const result = validateSubmission('media', {
    name: '  Reporter  ', email: 'reporter@example.com', organisation: 'Outlet', details: 'A detailed enquiry.',
    contactPermission: 'yes', website: 'https://example.com', honeypot: '',
  });
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.value.name, 'Reporter');
  assert.equal(validateSubmission('media', { name: 'R', email: 'r@example.com', organisation: 'O', details: 'D', honeypot: '' }).ok, false);
});

test('guest request enforces biography, suitability, and recording acknowledgement', () => {
  const valid = validateSubmission('guest', {
    name: 'Guest', email: 'guest@example.com', biography: 'A short biography.', proposedSubject: 'A useful subject',
    suitability: 'It gives readers practical evidence.', recordingPermission: 'yes', honeypot: '',
  });
  assert.equal(valid.ok, true);
  assert.equal(validateSubmission('guest', { name: 'Guest', email: 'guest@example.com', biography: 'Bio', proposedSubject: 'Subject', suitability: 'Why', honeypot: '' }).ok, false);
});

test('story identity and contact permissions have closed dependencies', () => {
  const anonymous = validateSubmission('story', {
    subtype: 'question', content: 'How should this be approached?', identityChoice: 'anonymous',
    publicationPermission: 'private', contactPermission: 'no', honeypot: '',
  });
  assert.equal(anonymous.ok, true);
  assert.equal(validateSubmission('story', { subtype: 'story', content: 'Story', identityChoice: 'pseudonym', publicationPermission: 'quote', contactPermission: 'no', honeypot: '' }).ok, false);
  assert.equal(validateSubmission('story', { subtype: 'story', content: 'Story', identityChoice: 'anonymous', publicationPermission: 'quote', contactPermission: 'yes', honeypot: '' }).ok, false);
});

test('all forms reject honeypots, malformed email and URL values, and oversized fields', () => {
  assert.equal(validateSubmission('media', { honeypot: 'spam' }).ok, false);
  assert.equal(validateSubmission('media', { name: 'R', email: 'bad', organisation: 'O', details: 'D', contactPermission: 'yes', honeypot: '' }).ok, false);
  assert.equal(validateSubmission('media', { name: 'R', email: 'r@example.com', organisation: 'O', details: 'D', website: 'http://example.com', contactPermission: 'yes', honeypot: '' }).ok, false);
  assert.equal(validateSubmission('media', { name: 'R'.repeat(101), email: 'r@example.com', organisation: 'O', details: 'D', contactPermission: 'yes', honeypot: '' }).ok, false);
});

