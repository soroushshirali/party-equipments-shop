"use client";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import "../styles/material-ui-font.css";
import "../styles/tailwind-font.css";
import "../styles/html-font.css";
import ClientLayout from '@/components/ClientLayout';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';

const vazir = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-vazir',
  display: 'swap',
  preload: true,
});

const metadata = {
  title: "فروشگاه تجهیزات پارتی",
  description: "فروشگاه آنلاین تجهیزات پارتی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontClasses = `${vazir.variable}`;
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => console.log('SW registered:', registration.scope))
        .catch((err) => console.log('SW registration failed:', err));
    }
  }, []);

  return (
    <html lang="fa" dir="rtl" className={fontClasses}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#3b82f6" />
        <style jsx global>{`
          * {
            font-family: var(--font-vazir), system-ui, sans-serif !important;
          }
        `}</style>
      </head>
      <body className="antialiased">
        <Provider store={store}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Provider>
      </body>
    </html>
  );
}