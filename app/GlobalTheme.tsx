'use client';

import { useEffect } from 'react';

export default function GlobalTheme({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const theme = localStorage.getItem('app-theme') || 'light';
    const font = localStorage.getItem('app-font') || 'sans';
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    document.documentElement.className = `font-${font} ${theme === 'dark' ? 'dark' : ''}`;
  }, []);

  return <>{children}</>;
}