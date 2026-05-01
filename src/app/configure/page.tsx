'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHouseStore } from '@/store/houseStore';
import BottomConfigBar from '@/components/BottomConfigBar';
import ConfigSummaryBadges from '@/components/ConfigSummaryBadges';

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
    <div className="min-h-screen bg-bg flex flex-col">

      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 z-30 relative">
        <button
          onClick={() => { reset(); router.push('/'); }}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Opnieuw
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-black text-[10px] font-bold">HC</span>
          </div>
          <span className="text-white/60 text-sm font-light">Configuratie</span>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="
            flex items-center gap-2 px-5 py-2 rounded-xl font-medium text-sm text-black
            bg-accent hover:bg-accent-hover
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 glow-accent-sm
          "
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Genereren…
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
              </svg>
              Genereer
            </>
          )}
        </button>
      </nav>

      {/* House image — fullscreen */}
      <div className="flex-1 relative flex items-center justify-center px-4 pb-48">
        <div className="relative w-full max-w-4xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalImage}
            alt="Jouw woning"
            className="w-full rounded-3xl shadow-2xl object-cover max-h-[62vh]"
          />

          {/* Config badges overlay */}
          <div className="absolute top-4 left-4 animate-fade-in">
            <ConfigSummaryBadges />
          </div>

          {/* Generating overlay */}
          {isGenerating && (
            <div className="absolute inset-0 rounded-3xl bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-5 animate-fade-in">
              {/* Animated rings */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute inset-2 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <div className="absolute inset-5 rounded-full bg-accent/20 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-lg mb-1">AI genereert je renovatie</p>
                <p className="text-gray-400 text-sm">Even geduld — dit duurt ±30 seconden</p>
              </div>
              {/* Progress bar */}
              <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full animate-[shimmer_2s_infinite]" style={{ width: '60%' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="fixed bottom-48 left-1/2 -translate-x-1/2 z-40 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl max-w-sm text-center">
          {error}
        </div>
      )}

      {/* Bottom configurator bar */}
      <BottomConfigBar />
    </div>
  );
}
