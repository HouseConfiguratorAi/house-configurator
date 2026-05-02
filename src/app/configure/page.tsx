'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHouseStore } from '@/store/houseStore';
import BottomConfigBar from '@/components/BottomConfigBar';
import ConfigSummaryBadges from '@/components/ConfigSummaryBadges';
import PopularCombos from '@/components/PopularCombos';
import MaterialPicker from '@/components/MaterialPicker';
import LightingSeasonBar from '@/components/LightingSeasonBar';
import FavoritesPanel from '@/components/FavoritesPanel';
import AICornerBrackets from '@/components/AICornerBrackets';
import AIGeneratingSteps from '@/components/AIGeneratingSteps';
import clsx from 'clsx';

type Panel = 'stijlen' | 'materialen' | 'sfeer' | 'favorieten' | null;

export default function ConfigurePage() {
  const router = useRouter();
  const { originalImage, config, lighting, season, setGeneratedImage, reset, undo, redo, canUndo, canRedo } = useHouseStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activePanel, setActivePanel] = useState<Panel>(null);

  useEffect(() => {
    if (!originalImage) router.replace('/');
  }, [originalImage, router]);

  const handleGenerate = async () => {
    if (!originalImage) return;
    setIsGenerating(true);
    setError('');
    setActivePanel(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: originalImage, config, lighting, season }),
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

  const togglePanel = (p: Panel) => setActivePanel(activePanel === p ? null : p);

  if (!originalImage) return null;

  const PANELS = [
    { id: 'stijlen' as Panel,    icon: '✨', label: 'Stijlen' },
    { id: 'materialen' as Panel, icon: '🧱', label: 'Materialen' },
    { id: 'sfeer' as Panel,      icon: '🌅', label: 'Sfeer' },
    { id: 'favorieten' as Panel, icon: '❤️', label: 'Favorieten' },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-accent/4 rounded-full blur-3xl" />
      </div>

      {/* Top nav */}
      <nav className="relative z-30 flex items-center justify-between px-4 py-3 border-b border-white/5">
        {/* Left: back + undo/redo */}
        <div className="flex items-center gap-1">
          <button onClick={() => { reset(); router.push('/'); }} className="p-2 text-gray-600 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="w-px h-5 bg-white/8 mx-1" />
          <button
            onClick={undo}
            disabled={!canUndo()}
            title="Ongedaan maken"
            className="p-2 text-gray-600 hover:text-white disabled:opacity-25 transition-colors rounded-lg hover:bg-white/5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            title="Opnieuw"
            className="p-2 text-gray-600 hover:text-white disabled:opacity-25 transition-colors rounded-lg hover:bg-white/5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
          </button>
        </div>

        {/* Center: logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-black text-[10px] font-bold">HC</span>
          </div>
          <span className="text-white/50 text-sm font-light hidden sm:block">Configurator</span>
        </div>

        {/* Right: panel shortcuts + generate */}
        <div className="flex items-center gap-1">
          {PANELS.map((p) => (
            <button
              key={p.id}
              onClick={() => togglePanel(p.id)}
              title={p.label}
              className={clsx(
                'p-2 rounded-lg text-sm transition-all duration-200',
                activePanel === p.id
                  ? 'bg-accent/20 text-accent'
                  : 'text-gray-600 hover:text-white hover:bg-white/5'
              )}
            >
              {p.icon}
            </button>
          ))}
          <div className="w-px h-5 bg-white/8 mx-1" />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm text-black bg-accent hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 glow-accent-sm"
          >
            {isGenerating ? (
              <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 3.21-1.81 6-4.72 7.72L13 17v5h5l-1.22-1.22C19.91 19.07 22 15.76 22 12c0-5.18-3.95-9.45-9-9.95zM11 2.05C5.95 2.55 2 6.82 2 12c0 3.76 2.09 7.07 5.22 8.78L6 22h5v-5l-2.28 2.72C7.81 18 6 15.21 6 12c0-4.08 3.05-7.44 7-7.93V2.05z"/>
              </svg>
            )}
            {isGenerating ? 'Bezig…' : 'Genereer'}
          </button>
        </div>
      </nav>

      {/* Dropdown panels */}
      {activePanel && (
        <div className="relative z-20 mx-4 mt-2 animate-slide-down">
          <div className="glass rounded-2xl p-4 border border-white/6 max-h-64 overflow-y-auto">
            {activePanel === 'stijlen'    && <PopularCombos />}
            {activePanel === 'materialen' && <MaterialPicker />}
            {activePanel === 'sfeer'      && <LightingSeasonBar />}
            {activePanel === 'favorieten' && <FavoritesPanel />}
          </div>
        </div>
      )}

      {/* House preview */}
      <div className="flex-1 relative flex items-center justify-center px-4 pb-44 pt-3">
        <div className="relative w-full max-w-4xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalImage}
            alt="Jouw woning"
            className="w-full rounded-3xl shadow-2xl object-cover max-h-[58vh]"
          />

          {/* AI corner brackets */}
          <AICornerBrackets size={20} className="m-3" />

          {/* Badges */}
          <div className="absolute top-4 left-4"><ConfigSummaryBadges /></div>

          {/* Hint */}
          {!isGenerating && !activePanel && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 glass-dark px-3 py-1.5 rounded-full">
              <p className="text-gray-400 text-xs whitespace-nowrap font-mono">↓ kies elementen</p>
            </div>
          )}

          {/* AI Generating overlay */}
          {isGenerating && <AIGeneratingSteps />}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-52 left-1/2 -translate-x-1/2 z-40 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl max-w-sm text-center">
          {error}
        </div>
      )}

      <BottomConfigBar />
    </div>
  );
}
