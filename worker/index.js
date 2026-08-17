const CANONICAL_HOST = 'cookedfinance.com';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isLocal = LOCAL_HOSTS.has(url.hostname);
    const lastSegment = url.pathname.split('/').pop() ?? '';
    const needsTrailingSlash =
      url.pathname !== '/' &&
      !url.pathname.endsWith('/') &&
      !lastSegment.includes('.');

    if ((!isLocal && (url.protocol !== 'https:' || url.hostname !== CANONICAL_HOST)) || needsTrailingSlash) {
      if (!isLocal) {
        url.protocol = 'https:';
        url.hostname = CANONICAL_HOST;
        url.port = '';
      }
      if (needsTrailingSlash) url.pathname = `${url.pathname}/`;
      return Response.redirect(url.toString(), 301);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    if (!isLocal) {
      headers.set('Strict-Transport-Security', 'max-age=31536000');
    }

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  },
};
