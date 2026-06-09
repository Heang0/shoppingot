import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'km',
  localePrefix: 'as-needed',
  localeDetection: false
});

export default async function middleware(req: NextRequest) {
  // 1. Run next-intl middleware
  const response = intlMiddleware(req);

  // 2. Check if we are on a subdomain or a custom domain
  const hostname = req.headers.get('host') || '';
  const isLocalhost = hostname.includes('localhost');
  const isShoppingot = hostname.includes('shoppingot.com');
  const hostParts = hostname.replace(/:\d+$/, '').split('.');

  let subdomain = null;
  let customDomainSlug = null;
  const isIpAddress = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname.replace(/:\d+$/, ''));

  if (isLocalhost && hostParts.length > 1) {
    subdomain = hostParts[0];
  } else if (!isLocalhost && !isIpAddress && hostParts.length > 2 && isShoppingot) {
    subdomain = hostParts[0];
  }

  // Check for custom domains
  if (!isLocalhost && !isShoppingot && !isIpAddress) {
    try {
      const cleanHostname = hostname.replace(/:\d+$/, '');
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const domainRes = await fetch(`${backendUrl}/api/stores/domain/${cleanHostname}`, { next: { revalidate: 60 } });
      if (domainRes.ok) {
        const data = await domainRes.json();
        customDomainSlug = data.slug;
      }
    } catch (err) {
      console.error('Failed to resolve custom domain:', err);
    }
  }

  // 3. Rewrite requests for subdomains or custom domains to the /store/[slug] route
  if ((subdomain && subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'admin' && subdomain !== 'shoppingot') || customDomainSlug) {
    // Only rewrite if it's not a redirect from next-intl (status 307/308)
    if (response.status === 200) {
      // next-intl might have rewritten the request internally, check x-middleware-rewrite
      const rewriteUrlStr = response.headers.get('x-middleware-rewrite');
      const url = rewriteUrlStr ? new URL(rewriteUrlStr) : req.nextUrl.clone();

      const pathParts = url.pathname.split('/'); // e.g. ['', 'en'] or ['', 'en', 'about']
      const locale = pathParts[1];

      if (locales.includes(locale as any)) {
        // Prevent infinite rewriting if it's already rewritten
        if (pathParts[2] !== 'store') {
          const targetSlug = customDomainSlug || subdomain;
          // Build new path: /en/store/steavnews/about
          const remainingPath = pathParts.slice(2).join('/');
          url.pathname = `/${locale}/store/${targetSlug}${remainingPath ? `/${remainingPath}` : ''}`;

          const rewriteResponse = NextResponse.rewrite(url);
          // Preserve headers from next-intl (like x-next-intl-locale)
          response.headers.forEach((value, key) => {
            if (key !== 'x-middleware-rewrite') {
              rewriteResponse.headers.set(key, value);
            }
          });
          return rewriteResponse;
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/(en|km)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
