/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface Env {
  SUBMISSIONS_DB: D1Database;
  RATE_LIMIT_KEY: string;
  TURNSTILE_SECRET_MEDIA: string;
  TURNSTILE_SECRET_GUEST: string;
  TURNSTILE_SECRET_STORY: string;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
}

declare namespace Cloudflare {
  interface Env {
    SUBMISSIONS_DB: D1Database;
    RATE_LIMIT_KEY: string;
    TURNSTILE_SECRET_MEDIA: string;
    TURNSTILE_SECRET_GUEST: string;
    TURNSTILE_SECRET_STORY: string;
    ACCESS_TEAM_DOMAIN: string;
    ACCESS_AUD: string;
  }
}

declare namespace App {
  interface Locals {
    accessEmail?: string;
  }
}
