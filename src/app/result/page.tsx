'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHouseStore } from '@/store/houseStore';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import AICornerBrackets from '@/components/AICornerBrackets';
import ShareButton from '@/components/ShareButton';
import SavedVersions from '@/components/SavedVersions';
import { ELEMENTS } from '@/lib/colorOptions';
import { LIGHTING_OPTIONS, SEASON_OPTIONS, FACADE_MATERIALS, ROOF_MATERIALS } from '@/lib/materials';
import clsx from 'clsx';

type Tab = 'keuzes' | 'versies';

export default function ResultPage() {
  const router = useRouter();
  const { originalImage, generatedImage, generatedPrompt, isMockResult, config, lighting, season, saveVersion, reset } = useHouseStore();
  const [tab, setTab] = useState<Tab>('keuzes');
  const [showPrompt, setShowPrompt] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!originalImage || !generatedImage) router.replace('/');
  }, [originalImage, generatedImage, router]);

  if (!originalImage || !generatedImage) return null;

  const lightOpt   = LIGHTING_OPTIONS.find((l) => l.id === lighting);
  const seasonOpt  = SEASON_OPTIONS.find((s) => s.id === season);
  const facadeMat  = FACADE_MATERIALS.find((m) => m.id === config.facadeMaterial);
  const roofMat    = ROOF_MATERIALS.find((m) => m.id === config.roofMaterial);

  const handleDownload = async () => {
    try {
      const res = await fetch(generatedImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'renovatie.jpg'; a.click();
      URL.revokeObjectURL(url);
    } catch {
      const a = document.createElement('a'); a.href = generatedImage; a.download = 'renovatie.jpg'; a.click();
    }
  };

  const handleSaveVersion = () => {
    const label = versionName.trim() || `Versie ${new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`;
    saveVersion(label);
    setSaved(true);
    setVersionName('');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportPDF = () => {
    window.open('/print', '_blank');
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <button onClick={() => router.push('/configure')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Aanpassen
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-black text-[10px] font-bold">HC</span>
          </div>
          <span className="text-white/50 text-sm font-light">Resultaat</span>
        </div>
        <button onClick={() => { reset(); router.push('/'); }} className="text-gray-500 hover:text-white text-sm transition-colors">
          Opnieuw
        </button>
      </nav>

      {/* Main */}
      <div className="relative z-10 flex flex-1 gap-5 p-5 overflow-hidden">

        {/* Slider */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="animate-scale-in relative">
            <BeforeAfterSlider before={originalImage} after={generatedImage} />
            <AICornerBrackets size={20} color="rgba(200,169,110,0.4)" className="m-3" />
            {/* AI badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 glass-dark px-2.5 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-[10px] font-mono">AI gegenereerd</span>
            </div>
          </div>
          <p className="text-center text-gray-700 text-xs mt-2.5">Sleep de slider om voor en na te vergelijken</p>

          {/* Context badges */}
          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            <span className="glass-dark text-gray-400 text-xs px-3 py-1 rounded-full">
              {lightOpt?.icon} {lightOpt?.label}
            </span>
            <span className="glass-dark text-gray-400 text-xs px-3 py-1 rounded-full">
              {seasonOpt?.icon} {seasonOpt?.label}
            </span>
            <span className="glass-dark text-gray-400 text-xs px-3 py-1 rounded-full">
              🧱 {facadeMat?.label}
            </span>
            <span className="glass-dark text-gray-400 text-xs px-3 py-1 rounded-full">
              🏠 {roofMat?.label}
            </span>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-72 flex flex-col gap-3 animate-slide-up overflow-y-auto">

          {/* Status */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={clsx('w-2 h-2 rounded-full', isMockResult ? 'bg-yellow-500' : 'bg-green-400')} />
              <span className="text-white font-semibold">{isMockResult ? 'Demo modus' : 'Renovatie klaar ✓'}</span>
            </div>
            <p className="text-gray-600 text-xs">
              {isMockResult ? 'Voeg REPLICATE_API_TOKEN toe voor echte AI' : 'Fotorealistisch gegenereerd door AI'}
            </p>
          </div>

          {/* Tabs */}
          <div className="glass rounded-2xl p-4 flex-1">
            <div className="flex gap-1 mb-4 bg-surface-elevated rounded-xl p-1">
              {(['keuzes', 'versies'] as Tab[]).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={clsx(
                  'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize',
                  tab === t ? 'bg-accent text-black' : 'text-gray-500 hover:text-white'
                )}>
                  {t === 'keuzes' ? '🎨 Keuzes' : '📂 Versies'}
                </button>
              ))}
            </div>

            {tab === 'keuzes' && (
              <div className="space-y-2">
                {ELEMENTS.map((el) => {
                  const selected = el.colors.find((c) => c.id === config[el.id]);
                  return (
                    <div key={el.id} className="flex items-center justify-between bg-surface-elevated px-3 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span>{el.icon}</span>{el.label}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: selected?.hex ?? '#888' }} />
                        <span className="text-white text-sm font-medium">{selected?.label ?? '—'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'versies' && (
              <SavedVersions onLoad={() => setTab('keuzes')} />
            )}
          </div>

          {/* Prompt */}
          {generatedPrompt && (
            <div className="glass rounded-2xl overflow-hidden">
              <button onClick={() => setShowPrompt(!showPrompt)} className="w-full flex items-center justify-between px-4 py-3 text-gray-500 hover:text-gray-300 text-xs transition-colors">
                <span>🤖 AI prompt</span>
                <svg className={`w-3 h-3 transition-transform ${showPrompt ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showPrompt && (
                <div className="px-4 pb-3 border-t border-white/5">
                  <p className="text-gray-600 text-xs leading-relaxed mt-2">{generatedPrompt}</p>
                </div>
              )}
            </div>
          )}

          {/* Save version */}
          <div className="glass rounded-2xl p-3">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Versie opslaan</p>
            <div className="flex gap-2">
              <input
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveVersion()}
                placeholder="Naam (optioneel)…"
                className="flex-1 bg-surface-elevated border border-white/8 rounded-lg px-2.5 py-1.5 text-white text-xs placeholder-gray-700 outline-none focus:border-accent/40"
              />
              <button
                onClick={handleSaveVersion}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  saved ? 'bg-green-500/20 text-green-400' : 'bg-accent/20 text-accent hover:bg-accent/30'
                )}
              >
                {saved ? '✓' : 'Sla op'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button onClick={handleDownload} className="w-full py-3 rounded-xl font-semibold text-sm text-black bg-accent hover:bg-accent-hover transition-all duration-200 glow-accent-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download afbeelding
            </button>
            <button onClick={handleExportPDF} className="w-full py-3 rounded-xl font-medium text-sm text-white bg-surface-elevated hover:bg-surface-high border border-surface-border transition-all duration-200 flex items-center justify-center gap-2">
              📄 Exporteer als PDF
            </button>
            <ShareButton imageUrl={generatedImage} />
            <button onClick={() => router.push('/configure')} className="w-full py-2.5 rounded-xl font-medium text-sm text-gray-500 hover:text-white transition-colors">
              ✏️ Verder aanpassen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
