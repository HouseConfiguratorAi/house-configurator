'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHouseStore } from '@/store/houseStore';
import ConfigPanel from '@/components/ConfigPanel';

export default function ConfigurePage() {
  const router = useRouter();
  const { originalImage, config, setGeneratedImage, reset } = useHouseStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!originalImage) router.replace('/');
  }, [originalImage, router]);

  const handleGenerate = async () => {
    if (!originalImage) return;
    setIsGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: originalImage, config }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generatie mislukt');
      }
      const data = await res.json();
      setGeneratedImage(data.imageUrl, data.prompt, data.mock);
      router.push('/result');
    } catch (err) {
      setError(String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  if (!originalImage) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <button
          onClick={() => { reset(); router.push('/'); }}
          className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-2"
        >
          ← Opnieuw starten
        </button>
        <h1 className="text-white font-medium text-sm tracking-wide">Configureer je woning</h1>
        <div className="w-28" />
      </nav>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* House preview */}
        <div className="flex-1 flex items-center justify-center p-6 bg-[#080808]">
          <div className="relative max-w-3xl w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalImage}
              alt="Jouw woning"
              className="w-full rounded-2xl shadow-2xl"
            />
            {isGenerating && (
              <div className="absolute inset-0 rounded-2xl bg-black/70 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-white font-medium">AI genereert je renovatie…</p>
                <p className="text-gray-400 text-sm">Dit duurt ±30 seconden</p>
              </div>
            )}
          </div>
        </div>

        {/* Config panel */}
        <div className="w-80 border-l border-white/5 bg-surface flex flex-col p-6 overflow-y-auto">
          <ConfigPanel />

          <div className="mt-6 space-y-3">
            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg p-3">{error}</p>
            )}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="
                w-full py-4 rounded-xl font-semibold text-black text-base
                bg-accent hover:bg-accent-hover
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 shadow-lg shadow-accent/20
                flex items-center justify-center gap-2
              "
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Genereren…
                </>
              ) : (
                '✨ Genereer renovatie'
              )}
            </button>
            <p className="text-gray-600 text-xs text-center">
              Powered by AI — resultaat in ~30s
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
