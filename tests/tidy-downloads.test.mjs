import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const harness = fileURLToPath(new URL('../public/downloads/test-tidy-downloads.sh', import.meta.url));

test('downloadable tidy-downloads.sh passes its shell test harness', () => {
  const result = spawnSync('bash', [harness], { encoding: 'utf8' });
  assert.equal(result.status, 0, `harness failed:\n${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /^PASS$/m);
});
