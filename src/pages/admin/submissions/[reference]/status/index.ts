import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { isSameOrigin } from '../../../../../lib/admin/same-origin.ts';
import { updateSubmissionStatus } from '../../../../../lib/submissions/repository.ts';
import { submissionStatuses, type SubmissionStatus } from '../../../../../lib/submissions/types.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request, params, locals, redirect }) => {
  if (!isSameOrigin(request)) return new Response('Forbidden', { status: 403 });

  const reference = params.reference;
  const email = locals.accessEmail;
  if (!reference || !email) return new Response('Forbidden', { status: 403 });

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/x-www-form-urlencoded') && !contentType.includes('multipart/form-data')) {
    return new Response('Unsupported content type', { status: 415 });
  }

  const formData = await request.formData();
  const status = formData.get('status');
  if (typeof status !== 'string' || !submissionStatuses.includes(status as SubmissionStatus)) {
    return new Response('Invalid status', { status: 400 });
  }

  await updateSubmissionStatus(env.SUBMISSIONS_DB, reference, status as SubmissionStatus, email);
  return redirect(`/admin/submissions/${reference}/`, 303);
};
