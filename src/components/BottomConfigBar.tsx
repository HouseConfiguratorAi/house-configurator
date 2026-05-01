'use client';

import { useState } from 'react';
import { useHouseStore } from '@/store/houseStore';
import { ELEMENTS } from '@/lib/colorOptions';
import type { HouseConfig } from '@/lib/types';
import clsx from 'clsx';

export default function BottomConfigBar() {
  const { config, setConfig } = useHouseStore();
  const [active, setActive] = useState<keyof HouseConfig | null>(null);

  const activeEl = ELEMENTS.find((e) => e.id === active);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">

      {/* Color swatches panel */}
      {activeEl && (
        <div className="mx-4 mb-2 animate-slide-up">
          <div className="glass-dark rounded-2xl p-4">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-3">
              {activeEl.label} — {activeEl.colors.length} kleuren
            </p>
            <div className="flex gap-2 flex-wrap">
              {activeEl.colors.map((color) => {
                const isSelected = config[activeEl.id] === color.id;
                return (
                  <button
                    key={color.id}
                    onClick={() => setConfig({ [activeEl.id]: color.id })}
                    title={color.label}
                    className="group relative flex flex-col items-center gap-1 transition-all duration-150"
                  >
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-full border-2 transition-all duration-150 shadow-md',
                        isSelected
                          ? 'border-accent scale-125 shadow-accent/30'
                          : 'border-white/10 hover:border-white/40 hover:scale-110'
                      )}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className={clsx(
                      'text-[9px] leading-tight text-center max-w-[40px] transition-colors',
                      isSelected ? 'text-accent' : 'text-gray-600 group-hover:text-gray-400'
                    )}>
                      {color.label}
                    </span>
                    {isSelected && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full flex items-center justify-center shadow-sm">
                        <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                          <path d="M1 3L2.5 4.5L5 1.5" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Element tabs */}
      <div className="mx-4 mb-4">
        <div className="glass-dark rounded-2xl p-1.5 flex gap-1">
          {ELEMENTS.map((el) => {
            const selected = el.colors.find((c) => c.id === config[el.id]);
            const isActive = active === el.id;
            return (
              <button
                key={el.id}
                onClick={() => setActive(isActive ? null : el.id)}
                className={clsx(
                  'flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-accent text-black'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                )}
              >
                <span className="text-lg">{el.icon}</span>
                <span className="text-[11px] font-medium">{el.label}</span>
                {selected && !isActive && (
                  <div
                    className="w-3 h-3 rounded-full border border-white/20 mt-0.5"
                    style={{ backgroundColor: selected.hex }}
                  />
                )}
                {isActive && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
