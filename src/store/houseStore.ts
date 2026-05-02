'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HouseConfig, LightingOption, SeasonOption, SavedVersion, FavoriteCombo } from '@/lib/types';
import { DEFAULT_CONFIG } from '@/lib/colorOptions';

const MAX_HISTORY = 30;
const MAX_VERSIONS = 3;

interface HouseStore {
  // Image
  originalImage: string | null;
  originalImageName: string | null;

  // Config
  config: HouseConfig;
  lighting: LightingOption;
  season: SeasonOption;

  // History (undo/redo)
  history: HouseConfig[];
  historyIndex: number;

  // Generated
  generatedImage: string | null;
  generatedPrompt: string | null;
  isMockResult: boolean;

  // Saved versions (up to 3)
  savedVersions: SavedVersion[];

  // Favorites
  favorites: FavoriteCombo[];

  // Actions
  setOriginalImage: (base64: string, name: string) => void;
  setConfig: (config: Partial<HouseConfig>) => void;
  setLighting: (l: LightingOption) => void;
  setSeason: (s: SeasonOption) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setGeneratedImage: (url: string, prompt: string, mock?: boolean) => void;
  saveVersion: (label: string) => void;
  removeVersion: (id: string) => void;
  loadVersion: (version: SavedVersion) => void;
  addFavorite: (label: string) => void;
  removeFavorite: (id: string) => void;
  applyFavorite: (fav: FavoriteCombo) => void;
  reset: () => void;
}

export const useHouseStore = create<HouseStore>()(
  persist(
    (set, get) => ({
      originalImage: null,
      originalImageName: null,
      config: { ...DEFAULT_CONFIG },
      lighting: 'day',
      season: 'summer',
      history: [{ ...DEFAULT_CONFIG }],
      historyIndex: 0,
      generatedImage: null,
      generatedPrompt: null,
      isMockResult: false,
      savedVersions: [],
      favorites: [],

      setOriginalImage: (base64, name) =>
        set({ originalImage: base64, originalImageName: name, generatedImage: null }),

      setConfig: (partial) => {
        const { config, history, historyIndex } = get();
        const newConfig = { ...config, ...partial };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newConfig);
        if (newHistory.length > MAX_HISTORY) newHistory.shift();
        set({
          config: newConfig,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      setLighting: (lighting) => set({ lighting }),
      setSeason: (season) => set({ season }),

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        set({ config: { ...history[newIndex] }, historyIndex: newIndex });
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;
        const newIndex = historyIndex + 1;
        set({ config: { ...history[newIndex] }, historyIndex: newIndex });
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      setGeneratedImage: (url, prompt, mock = false) =>
        set({ generatedImage: url, generatedPrompt: prompt, isMockResult: mock }),

      saveVersion: (label) => {
        const { generatedImage, config, lighting, season, savedVersions } = get();
        if (!generatedImage) return;
        const newVersion: SavedVersion = {
          id: Date.now().toString(),
          imageUrl: generatedImage,
          config: { ...config },
          lighting,
          season,
          label,
          createdAt: Date.now(),
        };
        const updated = [newVersion, ...savedVersions].slice(0, MAX_VERSIONS);
        set({ savedVersions: updated });
      },

      removeVersion: (id) =>
        set((s) => ({ savedVersions: s.savedVersions.filter((v) => v.id !== id) })),

      loadVersion: (version) =>
        set({
          config: { ...version.config },
          lighting: version.lighting,
          season: version.season,
          generatedImage: version.imageUrl,
        }),

      addFavorite: (label) => {
        const { config, favorites } = get();
        const newFav: FavoriteCombo = {
          id: Date.now().toString(),
          label,
          config: { ...config },
        };
        set({ favorites: [...favorites, newFav].slice(-10) });
      },

      removeFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),

      applyFavorite: (fav) => {
        const { history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ ...fav.config });
        set({
          config: { ...fav.config },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      reset: () =>
        set({
          originalImage: null,
          originalImageName: null,
          config: { ...DEFAULT_CONFIG },
          lighting: 'day',
          season: 'summer',
          history: [{ ...DEFAULT_CONFIG }],
          historyIndex: 0,
          generatedImage: null,
          generatedPrompt: null,
          isMockResult: false,
        }),
    }),
    {
      name: 'house-configurator-v2',
      partialize: (s) => ({
        originalImage: s.originalImage,
        originalImageName: s.originalImageName,
        config: s.config,
        lighting: s.lighting,
        season: s.season,
        generatedImage: s.generatedImage,
        generatedPrompt: s.generatedPrompt,
        isMockResult: s.isMockResult,
        savedVersions: s.savedVersions,
        favorites: s.favorites,
      }),
    }
  )
);
