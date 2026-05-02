'use client';

import { useHouseStore } from '@/store/houseStore';
import type { SavedVersion } from '@/lib/types';
import { LIGHTING_OPTIONS, SEASON_OPTIONS } from '@/lib/materials';
import clsx from 'clsx';

interface Props {
  onLoad?: (v: SavedVersion) => void;
}

export default function SavedVersions({ onLoad }: Props) {
  const { savedVersions, removeVersion, loadVersion } = useHouseStore();

  if (savedVersions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-600 text-sm">
        <p className="text-2xl mb-2">📂</p>
        <p>Nog geen versies opgeslagen.</p>
        <p className="text-xs mt-1">Klik op "Versie opslaan" na generatie.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {savedVersions.map((v) => {
        const lighting = LIGHTING_OPTIONS.find((l) => l.id === v.lighting);
        const season = SEASON_OPTIONS.find((s) => s.id === v.season);
        return (
          <div key={v.id} className="flex gap-3 bg-surface-elevated rounded-xl p-2.5 border border-surface-border group">
            {/* Thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={v.imageUrl}
              alt={v.label}
              className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
            />
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{v.label}</p>
              <p className="text-gray-600 text-[10px] mt-0.5">
                {lighting?.icon} {lighting?.label} · {season?.icon} {season?.label}
              </p>
              <div className="flex gap-1 mt-1.5">
                <button
                  onClick={() => { loadVersion(v); onLoad?.(v); }}
                  className="text-[10px] text-accent hover:text-accent-hover px-2 py-0.5 rounded-md bg-accent/10 transition-colors"
                >
                  Laden
                </button>
                <button
                  onClick={() => removeVersion(v.id)}
                  className="text-[10px] text-gray-600 hover:text-red-400 px-2 py-0.5 rounded-md hover:bg-red-400/10 transition-colors"
                >
                  Verwijder
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <p className="text-gray-700 text-[10px] text-center pt-1">
        Max. 3 versies — oudste wordt overschreven
      </p>
    </div>
  );
}
