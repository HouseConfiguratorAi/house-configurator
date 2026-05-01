'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHouseStore } from '@/store/houseStore';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { ELEMENTS } from '@/lib/colorOptions';

export default function ResultPage() {
  const router = useRouter();
  const { originalImage, generatedImage, generatedPrompt, isMockResult, config, reset } =
    useHouseStore();

  useEffect(() => {
    if (!originalImage || !generatedImage) router.replace('/');
  }, [originalImage, generatedImage, router]);

  if (!originalImage || !generatedImage) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = 'renovatie-resultaat.jpg';
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <button
          onClick={() => router.push('/configure')}
          className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-2"
        >
          ← Terug naar configuratie
        </button>
        <h1 className="text-white font-medium text-sm tracking-wide">Jouw renovatie</h1>
        <button
          onClick={() => { reset(); router.push('/'); }}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          Opnieuw starten
        </button>
      </nav>

      {/* Main content */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Slider */}
        <div className="flex-1 flex items-center justify-center p-8 bg-[#080808]">
          <div className="w-full max-w-4xl space-y-4">
            <BeforeAfterSlider before={originalImage} after={generatedImage} />
            <p className="text-center text-gray-600 text-xs">
              Sleep de slider om voor en na te vergelijken
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-80 border-l border-white/5 bg-surface flex flex-col p-6 overflow-y-auto">
          <h2 className="text-white font-semibold text-lg mb-1">Renovatie klaar</h2>
          <p className="text-gray-400 text-sm mb-6">
            {isMockResult
              ? '⚠️ Demo-modus — voeg REPLICATE_API_TOKEN toe voor echte AI'
              : '✅ Gegenereerd door AI'}
          </p>

          {/* Config summary */}
          <div className="space-y-3 mb-6">
            {ELEMENTS.map((el) => {
              const selected = el.colors.find((c) => c.id === config[el.id]);
              return (
                <div
                  key={el.id}
                  className="flex items-center justify-between bg-surface-elevated px-4 py-3 rounded-xl"
                >
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span>{el.icon}</span>
                    {el.label}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-white/10"
                      style={{ backgroundColor: selected?.hex ?? '#888' }}
                    />
                    <span className="text-white text-sm">{selected?.label ?? '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Prompt (collapsed) */}
          {generatedPrompt && (
            <details className="mb-6">
              <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-300 transition-colors">
                AI prompt bekijken
              </summary>
              <p className="text-gray-600 text-xs mt-2 leading-relaxed">{generatedPrompt}</p>
            </details>
          )}

          {/* Actions */}
          <div className="space-y-3 mt-auto">
            <button
              onClick={handleDownload}
              className="w-full py-3 rounded-xl font-medium text-black bg-accent hover:bg-accent-hover transition-colors"
            >
              ↓ Download resultaat
            </button>
            <button
              onClick={() => router.push('/configure')}
              className="w-full py-3 rounded-xl font-medium text-white bg-surface-elevated hover:bg-surface-high transition-colors"
            >
              ✏️ Aanpassen
            </button>
            <button
              onClick={() => { reset(); router.push('/'); }}
              className="w-full py-3 rounded-xl font-medium text-gray-500 hover:text-white transition-colors text-sm"
            >
              Nieuwe woning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
