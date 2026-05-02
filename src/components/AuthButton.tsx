'use client';
import Link from 'next/link';

export default function AuthButton() {
  return (
    <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
      Home
    </Link>
  );
}
