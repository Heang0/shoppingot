import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { Inter, Kantumruy_Pro } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: 'swap' });
const kantumruy = Kantumruy_Pro({ 
  subsets: ["khmer"], 
  display: 'swap',
  variable: '--font-kantumruy'
});

import { Viewport } from 'next';

export const metadata = {
  title: 'ShoppingOT',
  description: 'Multi-vendor SaaS e-commerce platform',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
 
export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();
 
  // Select the font based on the locale
  const fontClass = locale === 'km' ? `${kantumruy.className} ${kantumruy.variable} lang-km` : `${inter.className} ${kantumruy.variable}`;

  return (
    <div className={fontClass}>
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
