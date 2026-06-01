import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'km',
  localePrefix: 'as-needed'
});

export default function middleware(req: NextRequest) {
  // 1. Run next-intl middleware
  const response = intlMiddleware(req);

  // 2. Check if we are on a subdomain
  const hostname = req.headers.get('host') || '';
  const isLocalhost = hostname.includes('localhost');
  const hostParts = hostname.replace(/:\d+$/, '').split('.');
  
  let subdomain = null;
  if (isLocalhost && hostParts.length > 1) {
    subdomain = hostParts[0];
  } else if (!isLocalhost && hostParts.length > 2) {
    subdomain = hostParts[0];
  }

  // 3. Rewrite requests for subdomains to the /store/[slug] route
  if (subdomain && subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'admin') {
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
          // Build new path: /en/store/steavnews/about
          const remainingPath = pathParts.slice(2).join('/');
          url.pathname = `/${locale}/store/${subdomain}${remainingPath ? `/${remainingPath}` : ''}`;
          
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
