import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { handleSubmission } from '../../../lib/submissions/handle-submission.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const result = await handleSubmission(request, 'guest', env);
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
};
