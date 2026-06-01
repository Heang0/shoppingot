import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
// Can be imported from a shared config
export const locales = ['en', 'km'];
 
export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  
  console.log("i18n requested with locale:", locale);
  let resolvedLocale = locale;
  if (!locale || !locales.includes(locale as any)) {
    console.log("Locale not found, falling back to 'en'");
    resolvedLocale = 'en';
  }
 
  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default
  };
});
