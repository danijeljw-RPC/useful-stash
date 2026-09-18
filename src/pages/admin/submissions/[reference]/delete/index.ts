import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { isSameOrigin } from '../../../../../lib/admin/same-origin.ts';
import { deleteSubmission } from '../../../../../lib/submissions/repository.ts';

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
  if (formData.get('confirm') !== 'yes') {
    return new Response('Confirmation required', { status: 400 });
  }

  await deleteSubmission(env.SUBMISSIONS_DB, reference);
  return redirect('/admin/submissions/', 303);
};
