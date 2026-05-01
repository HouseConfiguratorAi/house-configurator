'use client';

import { useHouseStore } from '@/store/houseStore';
import { ELEMENTS } from '@/lib/colorOptions';

export default function ConfigSummaryBadges() {
  const { config } = useHouseStore();

  return (
    <div className="flex gap-2 flex-wrap">
      {ELEMENTS.map((el) => {
        const selected = el.colors.find((c) => c.id === config[el.id]);
        return (
          <div
            key={el.id}
            className="flex items-center gap-1.5 bg-surface-elevated border border-surface-border px-2.5 py-1 rounded-full"
          >
            <div
              className="w-2.5 h-2.5 rounded-full border border-white/10 flex-shrink-0"
              style={{ backgroundColor: selected?.hex ?? '#888' }}
            />
            <span className="text-gray-400 text-xs">{el.label}</span>
            <span className="text-white text-xs font-medium">{selected?.label ?? '—'}</span>
          </div>
        );
      })}
    </div>
  );
}
