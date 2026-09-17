import { createPublicReference } from './references.ts';
import { submissionKinds, submissionStatuses, type StoredSubmission, type SubmissionKind, type SubmissionStatus, type ValidatedSubmission } from './types.ts';

type SubmissionRow = {
  id: string; public_reference: string; kind: SubmissionKind; subtype: 'story' | 'question' | null;
  status: SubmissionStatus; payload_json: string; created_at: string; updated_at: string; status_updated_by: string | null;
};

const mapRow = (row: SubmissionRow): StoredSubmission => ({
  id: row.id, publicReference: row.public_reference, kind: row.kind, subtype: row.subtype, status: row.status,
  payload: JSON.parse(row.payload_json) as ValidatedSubmission, createdAt: row.created_at, updatedAt: row.updated_at,
  statusUpdatedBy: row.status_updated_by,
});

export async function createSubmission(
  db: D1Database,
  payload: ValidatedSubmission,
  options: { now?: Date; reference?: () => string; maxAttempts?: number } = {},
): Promise<StoredSubmission> {
  const now = (options.now ?? new Date()).toISOString();
  const id = crypto.randomUUID();
  const maxAttempts = options.maxAttempts ?? 3;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const publicReference = (options.reference ?? createPublicReference)();
    try {
      await db.prepare(`INSERT INTO submissions
        (id, public_reference, kind, subtype, status, payload_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'new', ?, ?, ?)`).bind(
        id, publicReference, payload.kind, payload.subtype ?? null, JSON.stringify(payload), now, now,
      ).run();
      return (await getSubmission(db, publicReference))!;
    } catch (error) {
      if (!String(error).toLowerCase().includes('unique') || attempt === maxAttempts - 1) throw error;
    }
  }
  throw new Error('Unable to create a public reference.');
}

export async function getSubmission(db: D1Database, reference: string): Promise<StoredSubmission | null> {
  const row = await db.prepare('SELECT * FROM submissions WHERE public_reference = ?').bind(reference).first<SubmissionRow>();
  return row ? mapRow(row) : null;
}

export async function listSubmissions(db: D1Database, options: {
  kind?: SubmissionKind; subtype?: 'story' | 'question'; status?: SubmissionStatus; page?: number; pageSize?: number;
} = {}): Promise<{ items: StoredSubmission[]; total: number; page: number; pages: number }> {
  if (options.kind && !submissionKinds.includes(options.kind)) throw new TypeError('Invalid submission kind.');
  if (options.status && !submissionStatuses.includes(options.status)) throw new TypeError('Invalid submission status.');
  const page = Math.max(1, Math.trunc(options.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Math.trunc(options.pageSize ?? 20)));
  const clauses: string[] = [];
  const values: (string | number)[] = [];
  if (options.kind) { clauses.push('kind = ?'); values.push(options.kind); }
  if (options.subtype) { clauses.push('subtype = ?'); values.push(options.subtype); }
  if (options.status) { clauses.push('status = ?'); values.push(options.status); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const totalRow = await db.prepare(`SELECT COUNT(*) AS count FROM submissions ${where}`).bind(...values).first<{ count: number }>();
  const result = await db.prepare(`SELECT * FROM submissions ${where} ORDER BY created_at DESC, public_reference ASC LIMIT ? OFFSET ?`)
    .bind(...values, pageSize, (page - 1) * pageSize).all<SubmissionRow>();
  const total = totalRow?.count ?? 0;
  return { items: result.results.map(mapRow), total, page, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function updateSubmissionStatus(db: D1Database, reference: string, status: SubmissionStatus, email: string, now = new Date()): Promise<boolean> {
  if (!submissionStatuses.includes(status)) throw new TypeError('Invalid submission status.');
  const result = await db.prepare('UPDATE submissions SET status = ?, updated_at = ?, status_updated_by = ? WHERE public_reference = ?')
    .bind(status, now.toISOString(), email, reference).run();
  return (result.meta.changes ?? 0) > 0;
}

export async function deleteSubmission(db: D1Database, reference: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM submissions WHERE public_reference = ?').bind(reference).run();
  return (result.meta.changes ?? 0) > 0;
}

