import type { IncomingMessage } from 'node:http';

// The site's public address (scheme and host, no trailing slash), for absolute links
// such as og:url. Read from SITE_URL on each request. Without it (local development)
// it is the address the request came in on.
export function siteOrigin(req: IncomingMessage): string {
  const configured = process.env.SITE_URL?.trim().replace(/\/+$/, '');
  if (configured) return configured;

  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto =
    (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)
      ?.split(',')[0]
      .trim() || 'http';
  return `${proto}://${req.headers.host ?? 'localhost'}`;
}
