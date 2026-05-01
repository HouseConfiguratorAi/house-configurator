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

      {/* Color swatches panel — slides up when element selected */}
      {activeEl && (
        <div className="mx-4 mb-2 animate-slide-up">
          <div className="glass-dark rounded-2xl p-4">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">
              {activeEl.label} kleur kiezen
            </p>
            <div className="flex gap-2 flex-wrap">
              {activeEl.colors.map((color) => {
                const isSelected = config[activeEl.id] === color.id;
                return (
                  <button
                    key={color.id}
                    onClick={() => setConfig({ [activeEl.id]: color.id })}
                    title={color.label}
                    className={clsx(
                      'group relative flex flex-col items-center gap-1.5 transition-all duration-200',
                      isSelected && 'scale-110'
                    )}
                  >
                    <div
                      className={clsx(
                        'w-9 h-9 rounded-full border-2 transition-all duration-200 shadow-lg',
                        isSelected
                          ? 'border-accent glow-accent-sm scale-110'
                          : 'border-white/10 hover:border-white/30'
                      )}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className={clsx(
                      'text-[10px] transition-colors duration-200',
                      isSelected ? 'text-accent' : 'text-gray-600'
                    )}>
                      {color.label}
                    </span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                        <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                          <path d="M1 3.5L2.8 5.5L6 1.5" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
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
        <div className="glass-dark rounded-2xl p-2 flex gap-1">
          {ELEMENTS.map((el) => {
            const selected = el.colors.find((c) => c.id === config[el.id]);
            const isActive = active === el.id;
            return (
              <button
                key={el.id}
                onClick={() => setActive(isActive ? null : el.id)}
                className={clsx(
                  'flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-accent text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <span className="text-xl">{el.icon}</span>
                <span className="text-[11px] font-medium">{el.label}</span>
                {selected && !isActive && (
                  <div
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: selected.hex }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
