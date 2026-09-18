// Astro's Cloudflare adapter regenerates dist/server/entry.mjs and
// dist/server/wrangler.json on every build, and only exports `fetch` from
// entry.mjs. Cloudflare Cron Triggers need a `scheduled` export too, so this
// script:
//   1. writes dist/server/scheduled-entry.mjs, a thin wrapper that
//      re-exports the generated fetch handler and adds the retention job;
//   2. patches dist/server/wrangler.json's `main` field to point at that
//      wrapper instead of entry.mjs.
//
// The delete-expired-submissions logic is intentionally duplicated here
// (kept in lockstep with src/lib/submissions/retention.ts, which is unit
// tested) rather than imported, because dist/server is deployed unbundled
// at this stage and a wrapper written outside the Vite/rolldown build
// cannot reliably resolve project source imports at runtime.
//
// Run automatically via the `postbuild` npm script.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const serverDir = fileURLToPath(new URL('../dist/server/', import.meta.url));
const entryPath = `${serverDir}scheduled-entry.mjs`;
const wranglerJsonPath = `${serverDir}wrangler.json`;

const wrapperContents = `import worker from './entry.mjs';

// Keep in sync with src/lib/submissions/retention.ts (deleteExpiredSubmissions).
async function deleteExpiredSubmissions(db, now = new Date()) {
  const cutoff = new Date(now.valueOf() - 7 * 24 * 60 * 60 * 1_000).toISOString();
  const result = await db.prepare('DELETE FROM submissions WHERE created_at <= ?').bind(cutoff).run();
  return result.meta.changes ?? 0;
}

export default {
  fetch: worker.fetch,
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(deleteExpiredSubmissions(env.SUBMISSIONS_DB));
  },
};
`;

await writeFile(entryPath, wrapperContents, 'utf8');
console.log('Wrote dist/server/scheduled-entry.mjs');

const wranglerJson = JSON.parse(await readFile(wranglerJsonPath, 'utf8'));
wranglerJson.main = 'scheduled-entry.mjs';
await writeFile(wranglerJsonPath, JSON.stringify(wranglerJson), 'utf8');
console.log('Patched dist/server/wrangler.json main -> scheduled-entry.mjs');
