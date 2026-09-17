import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;
const generator = join(root, 'scripts', 'generate-youtube-cover.sh');

test('cover generator preserves repeated tags, highlighting, and ring geometry', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'useful-stash-cover-'));
  const output = join(temp, 'cover');

  try {
    const result = spawnSync(
      generator,
      [
        '--tag=DOCKER',
        '--tag=.NET',
        '--title=your docker image is ^too big.^',
        '--subtitle=2.1GB ^→^ 482MB',
        '--shape=hexagon',
        `--output=${output}`,
        '--no-png',
      ],
      { encoding: 'utf8' },
    );

    assert.equal(result.status, 0, result.stderr);
    const svg = await readFile(`${output}.svg`, 'utf8');
    assert.match(svg, />\[ DOCKER \]<\/text>/);
    assert.match(svg, />\[ \.NET \]<\/text>/);
    assert.match(svg, /<tspan fill="#FF6B35">TOO BIG\.<\/tspan>/);
    assert.match(svg, /stroke="#15181D" stroke-width="22"/);
    assert.match(svg, /stroke="#1D2127" stroke-width="22"/);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
