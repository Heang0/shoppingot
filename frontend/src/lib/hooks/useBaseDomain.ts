import { useState, useEffect } from 'react';

export function useBaseDomain() {
  const [baseDomain, setBaseDomain] = useState('.shoppingot.com'); // Default fallback for SSR

  useEffect(() => {
    const host = window.location.host;
    
    if (host.includes('localhost')) {
      // Local development
      const port = host.split(':')[1] || '3000';
      setBaseDomain(`.localhost:${port}`);
    } else {
      // Production
      const parts = host.split('.');
      if (parts.length > 2) {
        // e.g., app.shoppingot.com -> .shoppingot.com
        setBaseDomain(`.${parts.slice(-2).join('.')}`);
      } else {
        // e.g., shoppingot.com -> .shoppingot.com
        setBaseDomain(`.${host}`);
      }
    }
  }, []);

  return baseDomain;
}
