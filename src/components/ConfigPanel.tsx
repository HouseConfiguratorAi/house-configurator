'use client';

import { useState } from 'react';
import { useHouseStore } from '@/store/houseStore';
import { ELEMENTS } from '@/lib/colorOptions';
import type { HouseConfig } from '@/lib/types';
import clsx from 'clsx';

export default function ConfigPanel() {
  const { config, setConfig } = useHouseStore();
  const [activeElement, setActiveElement] = useState<keyof HouseConfig>('roof');

  const active = ELEMENTS.find((e) => e.id === activeElement)!;

  return (
    <div className="flex flex-col h-full">
      {/* Element tabs */}
      <div className="grid grid-cols-4 gap-1 mb-6">
        {ELEMENTS.map((el) => (
          <button
            key={el.id}
            onClick={() => setActiveElement(el.id)}
            className={clsx(
              'flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-200',
              activeElement === el.id
                ? 'bg-accent text-black'
                : 'bg-surface-elevated text-gray-400 hover:bg-surface-high hover:text-white'
            )}
          >
            <span className="text-xl">{el.icon}</span>
            {el.label}
          </button>
        ))}
      </div>

      {/* Color swatches */}
      <div className="flex-1">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">
          {active.label} kleur
        </p>
        <div className="grid grid-cols-4 gap-2">
          {active.colors.map((color) => {
            const isSelected = config[activeElement] === color.id;
            return (
              <button
                key={color.id}
                onClick={() => setConfig({ [activeElement]: color.id })}
                title={color.label}
                className={clsx(
                  'group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200',
                  isSelected
                    ? 'bg-accent/20 ring-2 ring-accent'
                    : 'hover:bg-surface-high'
                )}
              >
                <div
                  className="w-8 h-8 rounded-full shadow-lg border border-white/10"
                  style={{ backgroundColor: color.hex }}
                />
                <span className={clsx('text-[10px] text-center leading-tight', isSelected ? 'text-accent' : 'text-gray-500')}>
                  {color.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current config summary */}
      <div className="mt-6 p-4 bg-surface-elevated rounded-xl space-y-2">
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Jouw configuratie</p>
        {ELEMENTS.map((el) => {
          const selected = el.colors.find((c) => c.id === config[el.id]);
          return (
            <div key={el.id} className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">{el.label}</span>
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
    </div>
  );
}
