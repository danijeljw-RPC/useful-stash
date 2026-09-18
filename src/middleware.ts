import { env } from 'cloudflare:workers';
import { defineMiddleware } from 'astro:middleware';
import { verifyAccessAssertion } from './lib/access/verify.ts';

export const onRequest = defineMiddleware(async (context, next) => {
  if (!context.url.pathname.startsWith('/admin/')) {
    return next();
  }

  const assertion = context.request.headers.get('Cf-Access-Jwt-Assertion');
  const result = await verifyAccessAssertion({
    assertion,
    teamDomain: env.ACCESS_TEAM_DOMAIN,
    audience: env.ACCESS_AUD,
  });

  if (!result.ok) {
    return new Response('Forbidden', {
      status: 403,
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'private, no-store' },
    });
  }

  context.locals.accessEmail = result.email;
  const response = await next();
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
});
