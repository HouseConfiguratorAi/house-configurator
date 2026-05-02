import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'House Configurator — AI Woning Renovatie',
  description: 'Visualiseer je droomrenovatie in seconden. Upload een foto, kies kleuren en laat AI de rest doen.',
  keywords: ['woning renovatie', 'AI configurator', 'gevel kleur', 'huis design'],
  openGraph: {
    title: 'House Configurator',
    description: 'AI-powered woning renovatie visualizer',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080808',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="nl" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen bg-bg antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
