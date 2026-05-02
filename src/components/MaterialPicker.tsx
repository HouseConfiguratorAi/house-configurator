'use client';

import { useHouseStore } from '@/store/houseStore';
import { FACADE_MATERIALS, ROOF_MATERIALS } from '@/lib/materials';
import clsx from 'clsx';

export default function MaterialPicker() {
  const { config, setConfig } = useHouseStore();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2.5">Gevel materiaal</p>
        <div className="grid grid-cols-3 gap-2">
          {FACADE_MATERIALS.map((mat) => {
            const active = config.facadeMaterial === mat.id;
            return (
              <button
                key={mat.id}
                onClick={() => setConfig({ facadeMaterial: mat.id })}
                className={clsx(
                  'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 text-center',
                  active
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-white/6 bg-surface-elevated hover:border-white/15 text-gray-400 hover:text-white'
                )}
              >
                <span className="text-xl">{mat.icon}</span>
                <span className="text-[10px] font-medium leading-tight">{mat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2.5">Dak materiaal</p>
        <div className="grid grid-cols-3 gap-2">
          {ROOF_MATERIALS.map((mat) => {
            const active = config.roofMaterial === mat.id;
            return (
              <button
                key={mat.id}
                onClick={() => setConfig({ roofMaterial: mat.id })}
                className={clsx(
                  'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 text-center',
                  active
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-white/6 bg-surface-elevated hover:border-white/15 text-gray-400 hover:text-white'
                )}
              >
                <span className="text-xl">{mat.icon}</span>
                <span className="text-[10px] font-medium leading-tight">{mat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
