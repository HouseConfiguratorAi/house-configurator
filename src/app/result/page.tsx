'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHouseStore } from '@/store/houseStore';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { ELEMENTS } from '@/lib/colorOptions';

export default function ResultPage() {
  const router = useRouter();
  const { originalImage, generatedImage, generatedPrompt, isMockResult, config, reset } = useHouseStore();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!originalImage || !generatedImage) router.replace('/');
  }, [originalImage, generatedImage, router]);

  if (!originalImage || !generatedImage) return null;

  const handleDownload = async () => {
    try {
      const res = await fetch(generatedImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'renovatie-resultaat.jpg';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const a = document.createElement('a');
      a.href = generatedImage;
      a.download = 'renovatie-resultaat.jpg';
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/4 rounded-full blur-3xl" />
      </div>

      {/* Top nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <button
          onClick={() => router.push('/configure')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Aanpassen
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-black text-[10px] font-bold">HC</span>
          </div>
          <span className="text-white/60 text-sm font-light">Resultaat</span>
        </div>

        <button
          onClick={() => { reset(); router.push('/'); }}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          Opnieuw
        </button>
      </nav>

      {/* Main layout */}
      <div className="relative z-10 flex flex-1 gap-6 p-6 overflow-hidden">

        {/* Slider — main */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="animate-scale-in">
            <BeforeAfterSlider before={originalImage} after={generatedImage} />
          </div>
          <p className="text-center text-gray-700 text-xs mt-3">
            Sleep de slider om voor en na te vergelijken
          </p>
        </div>

        {/* Right panel */}
        <div className="w-72 flex flex-col gap-4 animate-slide-up">

          {/* Status */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              {isMockResult ? (
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-green-400" />
              )}
              <span className="text-white font-semibold text-base">
                {isMockResult ? 'Demo modus' : 'Renovatie klaar'}
              </span>
            </div>
            <p className="text-gray-500 text-xs">
              {isMockResult
                ? 'Voeg REPLICATE_API_TOKEN toe voor AI-generatie'
                : 'AI-gegenereerd op basis van jouw configuratie'}
            </p>
          </div>

          {/* Config summary */}
          <div className="glass rounded-2xl p-5 flex-1">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">Jouw keuzes</p>
            <div className="space-y-3">
              {ELEMENTS.map((el) => {
                const selected = el.colors.find((c) => c.id === config[el.id]);
                return (
                  <div key={el.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-base">{el.icon}</span>
                      {el.label}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-white/10 shadow-sm"
                        style={{ backgroundColor: selected?.hex ?? '#888' }}
                      />
                      <span className="text-white text-sm font-medium">{selected?.label ?? '—'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Prompt toggle */}
          {generatedPrompt && (
            <div className="glass rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="w-full flex items-center justify-between px-5 py-3 text-gray-500 hover:text-gray-300 transition-colors text-xs"
              >
                <span>AI prompt</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${showPrompt ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showPrompt && (
                <div className="px-5 pb-4 border-t border-white/5">
                  <p className="text-gray-600 text-xs leading-relaxed mt-3">{generatedPrompt}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleDownload}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-black bg-accent hover:bg-accent-hover transition-all duration-200 glow-accent-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button
              onClick={() => router.push('/configure')}
              className="w-full py-3 rounded-xl font-medium text-sm text-white bg-surface-elevated hover:bg-surface-high border border-surface-border transition-all duration-200"
            >
              ✏️ Aanpassen
            </button>
            <button
              onClick={() => { reset(); router.push('/'); }}
              className="w-full py-3 rounded-xl font-medium text-sm text-gray-600 hover:text-gray-400 transition-colors"
            >
              Nieuwe woning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
