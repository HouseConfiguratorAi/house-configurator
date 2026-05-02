'use client';

import { useState } from 'react';
import { useHouseStore } from '@/store/houseStore';
import { ELEMENTS } from '@/lib/colorOptions';
import clsx from 'clsx';

export default function FavoritesPanel() {
  const { favorites, addFavorite, removeFavorite, applyFavorite, config } = useHouseStore();
  const [savingLabel, setSavingLabel] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleSave = () => {
    if (!savingLabel.trim()) return;
    addFavorite(savingLabel.trim());
    setSavingLabel('');
    setShowInput(false);
  };

  return (
    <div className="space-y-3">
      {/* Save current */}
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="w-full py-2 rounded-xl border border-dashed border-white/15 text-gray-500 hover:text-white hover:border-accent/40 text-xs transition-all duration-200"
        >
          + Huidige configuratie opslaan als favoriet
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            autoFocus
            value={savingLabel}
            onChange={(e) => setSavingLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Naam voor deze stijl…"
            className="flex-1 bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-600 outline-none focus:border-accent/50"
          />
          <button
            onClick={handleSave}
            className="px-3 py-2 bg-accent rounded-xl text-black text-xs font-medium"
          >
            Sla op
          </button>
          <button
            onClick={() => setShowInput(false)}
            className="px-3 py-2 text-gray-600 hover:text-white text-xs transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Favorites list */}
      {favorites.length === 0 ? (
        <p className="text-center text-gray-700 text-xs py-4">Nog geen favorieten opgeslagen.</p>
      ) : (
        <div className="space-y-2">
          {favorites.map((fav) => (
            <div key={fav.id} className="flex items-center gap-2 bg-surface-elevated rounded-xl px-3 py-2.5 border border-surface-border">
              {/* Color dots */}
              <div className="flex gap-0.5 flex-shrink-0">
                {ELEMENTS.map((el) => {
                  const color = el.colors.find((c) => c.id === fav.config[el.id as keyof typeof fav.config]);
                  return (
                    <div
                      key={el.id}
                      className="w-3 h-3 rounded-full border border-white/10"
                      style={{ backgroundColor: color?.hex ?? '#888' }}
                    />
                  );
                })}
              </div>
              <span className="text-white text-xs flex-1 truncate">{fav.label}</span>
              <button
                onClick={() => applyFavorite(fav)}
                className="text-[10px] text-accent hover:text-accent-hover px-2 py-0.5 rounded-md bg-accent/10 transition-colors"
              >
                Toepassen
              </button>
              <button
                onClick={() => removeFavorite(fav.id)}
                className="text-gray-600 hover:text-red-400 text-xs transition-colors ml-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
