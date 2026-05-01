'use client';

import { useHouseStore } from '@/store/houseStore';
import { POPULAR_COMBOS, ELEMENTS } from '@/lib/colorOptions';
import clsx from 'clsx';

export default function PopularCombos() {
  const { config, setConfig } = useHouseStore();

  const applyCombo = (combo: (typeof POPULAR_COMBOS)[0]) => {
    setConfig(combo.config);
  };

  const isActive = (combo: (typeof POPULAR_COMBOS)[0]) =>
    Object.entries(combo.config).every(([k, v]) => config[k as keyof typeof config] === v);

  return (
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Populaire combinaties</p>
      <div className="grid grid-cols-2 gap-2">
        {POPULAR_COMBOS.map((combo) => {
          const active = isActive(combo);
          return (
            <button
              key={combo.label}
              onClick={() => applyCombo(combo)}
              className={clsx(
                'flex items-center gap-2 p-2.5 rounded-xl border transition-all duration-200 text-left',
                active
                  ? 'border-accent bg-accent/10'
                  : 'border-white/6 bg-surface-elevated hover:border-white/15 hover:bg-surface-high'
              )}
            >
              {/* Color dots */}
              <div className="flex gap-0.5 flex-shrink-0">
                {ELEMENTS.map((el) => {
                  const color = el.colors.find((c) => c.id === combo.config[el.id as keyof typeof combo.config]);
                  return (
                    <div
                      key={el.id}
                      className="w-3 h-3 rounded-full border border-white/10"
                      style={{ backgroundColor: color?.hex ?? '#888' }}
                    />
                  );
                })}
              </div>
              <span className={clsx('text-xs font-medium', active ? 'text-accent' : 'text-gray-300')}>
                {combo.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
