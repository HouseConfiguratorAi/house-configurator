'use client';

import { useEffect } from 'react';
import { useHouseStore } from '@/store/houseStore';
import { ELEMENTS } from '@/lib/colorOptions';
import { LIGHTING_OPTIONS, SEASON_OPTIONS, FACADE_MATERIALS, ROOF_MATERIALS } from '@/lib/materials';

export default function PrintPage() {
  const { originalImage, generatedImage, config, lighting, season } = useHouseStore();

  const lightOpt = LIGHTING_OPTIONS.find((l) => l.id === lighting);
  const seasonOpt = SEASON_OPTIONS.find((s) => s.id === season);
  const facadeMat = FACADE_MATERIALS.find((m) => m.id === config.facadeMaterial);
  const roofMat = ROOF_MATERIALS.find((m) => m.id === config.roofMaterial);

  useEffect(() => {
    setTimeout(() => window.print(), 600);
  }, []);

  if (!originalImage || !generatedImage) {
    return <div className="p-8 text-gray-400">Geen resultaat beschikbaar om te exporteren.</div>;
  }

  return (
    <div className="bg-white min-h-screen p-10 font-sans text-gray-900">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#c8a96e] flex items-center justify-center">
              <span className="text-black text-xs font-bold">HC</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg">House Configurator</span>
          </div>
          <p className="text-gray-400 text-sm">AI-gegenereerde renovatievisualisatie</p>
        </div>
        <div className="text-right text-sm text-gray-400">
          <p>{new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="text-xs">houseconfiguratorai.vercel.app</p>
        </div>
      </div>

      {/* Images */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Voor</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={originalImage} alt="Voor" className="w-full rounded-xl object-cover aspect-video" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#c8a96e] mb-2">Na renovatie</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={generatedImage} alt="Na" className="w-full rounded-xl object-cover aspect-video" />
        </div>
      </div>

      {/* Config table */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Renovatie specificaties</h2>
        <div className="grid grid-cols-2 gap-3">
          {ELEMENTS.map((el) => {
            const color = el.colors.find((c) => c.id === config[el.id]);
            return (
              <div key={el.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3">
                <div className="w-6 h-6 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: color?.hex ?? '#888' }} />
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">{el.label}</p>
                  <p className="text-gray-800 font-semibold text-sm">{color?.label ?? '—'}</p>
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3">
            <span className="text-xl">🧱</span>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Gevel materiaal</p>
              <p className="text-gray-800 font-semibold text-sm">{facadeMat?.label ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3">
            <span className="text-xl">🏠</span>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Dak materiaal</p>
              <p className="text-gray-800 font-semibold text-sm">{roofMat?.label ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3">
            <span className="text-xl">{lightOpt?.icon}</span>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Belichting</p>
              <p className="text-gray-800 font-semibold text-sm">{lightOpt?.label ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3">
            <span className="text-xl">{seasonOpt?.icon}</span>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Seizoen</p>
              <p className="text-gray-800 font-semibold text-sm">{seasonOpt?.label ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-300 text-xs mt-8 no-print">
        Dit venster sluit na het printen. Sla op als PDF via je print dialog.
      </p>
    </div>
  );
}
