'use client';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center relative overflow-hidden">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(200,169,110,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,110,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-3xl" />
      </div>

      {/* HC logo */}
      <div className="relative z-10 flex flex-col items-center mb-8 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 mb-3">
          <span className="text-black text-sm font-bold font-mono">HC</span>
        </div>
        <span className="text-white font-medium text-sm">House Configurator</span>
        <span className="text-accent text-xs font-mono mt-0.5">AI · Woning Renovatie</span>
      </div>

      {/* Sign in component */}
      <div className="relative z-10 w-full max-w-md px-4 animate-slide-up">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-surface border border-white/8 shadow-2xl rounded-3xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-400',
              formButtonPrimary:
                'bg-accent hover:bg-accent-hover text-black font-semibold rounded-xl transition-colors',
              formFieldInput:
                'bg-surface-elevated border-white/10 text-white rounded-xl focus:border-accent/40 focus:ring-accent/20',
              formFieldLabel: 'text-gray-400 text-sm',
              footerActionLink: 'text-accent hover:text-accent-hover',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-accent',
              dividerLine: 'bg-white/8',
              dividerText: 'text-gray-600',
              socialButtonsBlockButton:
                'border border-white/10 bg-surface-elevated text-white hover:bg-surface-high rounded-xl transition-colors',
              socialButtonsBlockButtonText: 'text-gray-300',
            },
            variables: {
              colorBackground: '#111111',
              colorInputBackground: '#181818',
              colorText: '#ffffff',
              colorTextSecondary: '#9ca3af',
              colorPrimary: '#c8a96e',
              borderRadius: '0.75rem',
            },
          }}
        />
      </div>
    </main>
  );
}
