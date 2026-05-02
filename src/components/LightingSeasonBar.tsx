'use client';

import { useHouseStore } from '@/store/houseStore';
import { LIGHTING_OPTIONS, SEASON_OPTIONS } from '@/lib/materials';
import type { LightingOption, SeasonOption } from '@/lib/types';
import clsx from 'clsx';

export default function LightingSeasonBar() {
  const { lighting, season, setLighting, setSeason } = useHouseStore();

  return (
    <div className="flex gap-2">
      {/* Lighting */}
      <div className="flex-1">
        <p className="text-gray-600 text-[9px] uppercase tracking-widest mb-1.5 text-center">Licht</p>
        <div className="flex gap-1">
          {LIGHTING_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setLighting(opt.id as LightingOption)}
              title={opt.label}
              className={clsx(
                'flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] transition-all duration-200',
                lighting === opt.id
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'text-gray-600 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              <span className="text-base leading-none">{opt.icon}</span>
              <span className="hidden sm:block">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-px bg-white/8" />

      {/* Season */}
      <div className="flex-1">
        <p className="text-gray-600 text-[9px] uppercase tracking-widest mb-1.5 text-center">Seizoen</p>
        <div className="flex gap-1">
          {SEASON_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSeason(opt.id as SeasonOption)}
              title={opt.label}
              className={clsx(
                'flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] transition-all duration-200',
                season === opt.id
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'text-gray-600 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              <span className="text-base leading-none">{opt.icon}</span>
              <span className="hidden sm:block">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
