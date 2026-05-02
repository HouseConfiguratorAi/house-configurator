'use client';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function AuthButton() {
  const router = useRouter();
  return (
    <>
      <SignedOut>
        <button
          onClick={() => router.push('/sign-in')}
          className="text-gray-400 hover:text-white text-sm border border-white/10 px-3 py-1.5 rounded-xl hover:border-white/20 transition-all"
        >
          Inloggen
        </button>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white text-xs font-mono transition-colors"
          >
            Dashboard
          </button>
          <UserButton
            afterSignOutUrl="/"
            appearance={{ elements: { avatarBox: 'w-8 h-8' } }}
          />
        </div>
      </SignedIn>
    </>
  );
}
