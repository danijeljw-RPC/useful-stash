export async function deleteExpiredSubmissions(db: D1Database, now = new Date()): Promise<number> {
  const cutoff = new Date(now.valueOf() - 7 * 24 * 60 * 60 * 1_000).toISOString();
  const result = await db.prepare('DELETE FROM submissions WHERE created_at <= ?').bind(cutoff).run();
  return result.meta.changes ?? 0;
}
