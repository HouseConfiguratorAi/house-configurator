'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHouseStore } from '@/store/houseStore';
import BottomConfigBar from '@/components/BottomConfigBar';
import ConfigSummaryBadges from '@/components/ConfigSummaryBadges';
import PopularCombos from '@/components/PopularCombos';

export default function ConfigurePage() {
  const router = useRouter();
  const { originalImage, config, setGeneratedImage, reset } = useHouseStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showCombos, setShowCombos] = useState(false);

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
    <div className="min-h-screen bg-bg flex flex-col overflow-hidden">

      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-accent/4 rounded-full blur-3xl" />
      </div>

      {/* Top nav */}
      <nav className="relative z-30 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <button
          onClick={() => { reset(); router.push('/'); }}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Terug
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-black text-[10px] font-bold">HC</span>
          </div>
          <span className="text-white/60 text-sm font-light">Configureer je woning</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Combos shortcut */}
          <button
            onClick={() => setShowCombos(!showCombos)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
              showCombos ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-500 hover:text-white border border-white/10 hover:border-white/20'
            }`}
          >
            ✨ Stijlen
          </button>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm text-black bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 glow-accent-sm"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Genereren…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 3.21-1.81 6-4.72 7.72L13 17v5h5l-1.22-1.22C19.91 19.07 22 15.76 22 12c0-5.18-3.95-9.45-9-9.95zM11 2.05C5.95 2.55 2 6.82 2 12c0 3.76 2.09 7.07 5.22 8.78L6 22h5v-5l-2.28 2.72C7.81 18 6 15.21 6 12c0-4.08 3.05-7.44 7-7.93V2.05z"/>
                </svg>
                Genereer
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Popular combos dropdown */}
      {showCombos && (
        <div className="relative z-20 mx-6 mt-3 animate-slide-down">
          <div className="glass rounded-2xl p-4 border border-white/8">
            <PopularCombos />
          </div>
        </div>
      )}

      {/* House image — fullscreen */}
      <div className="flex-1 relative flex items-center justify-center px-4 pb-44 pt-4">
        <div className="relative w-full max-w-4xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalImage}
            alt="Jouw woning"
            className="w-full rounded-3xl shadow-2xl object-cover max-h-[58vh]"
          />

          {/* Config badges overlay */}
          <div className="absolute top-3 left-3 animate-fade-in">
            <ConfigSummaryBadges />
          </div>

          {/* Hint */}
          {!isGenerating && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 glass-dark px-3 py-1.5 rounded-full animate-fade-in">
              <p className="text-gray-400 text-xs whitespace-nowrap">Kies onderdelen hieronder ↓</p>
            </div>
          )}

          {/* Generating overlay */}
          {isGenerating && (
            <div className="absolute inset-0 rounded-3xl bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-5 animate-fade-in">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute inset-0 rounded-full border-2 border-accent/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
                <div className="absolute inset-2 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <div className="absolute inset-5 rounded-full bg-accent/20" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-lg mb-1">AI genereert je renovatie</p>
                <p className="text-gray-400 text-sm">Even geduld — dit duurt ±30 seconden</p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="fixed bottom-52 left-1/2 -translate-x-1/2 z-40 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl max-w-sm text-center">
          {error}
        </div>
      )}

      {/* Tesla bottom bar */}
      <BottomConfigBar />
    </div>
  );
}
