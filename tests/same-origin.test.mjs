import assert from 'node:assert/strict';
import test from 'node:test';

import { isSameOrigin } from '../src/lib/admin/same-origin.ts';

test('accepts a request whose Origin header matches the request host', () => {
  const request = new Request('https://usefulstash.com/admin/submissions/USTSH-ABC/status/', {
    method: 'POST',
    headers: { Origin: 'https://usefulstash.com' },
  });
  assert.equal(isSameOrigin(request), true);
});

test('rejects a missing Origin header, a cross-origin Origin, or a malformed Origin', () => {
  const noOrigin = new Request('https://usefulstash.com/admin/submissions/USTSH-ABC/status/', { method: 'POST' });
  assert.equal(isSameOrigin(noOrigin), false);

  const crossOrigin = new Request('https://usefulstash.com/admin/submissions/USTSH-ABC/status/', {
    method: 'POST',
    headers: { Origin: 'https://attacker.example.com' },
  });
  assert.equal(isSameOrigin(crossOrigin), false);

  const malformed = new Request('https://usefulstash.com/admin/submissions/USTSH-ABC/status/', {
    method: 'POST',
    headers: { Origin: 'not-a-url' },
  });
  assert.equal(isSameOrigin(malformed), false);
});
