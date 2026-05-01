'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HouseConfig } from '@/lib/types';
import { DEFAULT_CONFIG } from '@/lib/colorOptions';

interface HouseStore {
  originalImage: string | null;
  originalImageName: string | null;
  config: HouseConfig;
  generatedImage: string | null;
  generatedPrompt: string | null;
  isMockResult: boolean;

  setOriginalImage: (base64: string, name: string) => void;
  setConfig: (config: Partial<HouseConfig>) => void;
  setGeneratedImage: (url: string, prompt: string, mock?: boolean) => void;
  reset: () => void;
}

export const useHouseStore = create<HouseStore>()(
  persist(
    (set) => ({
      originalImage: null,
      originalImageName: null,
      config: { ...DEFAULT_CONFIG },
      generatedImage: null,
      generatedPrompt: null,
      isMockResult: false,

      setOriginalImage: (base64, name) =>
        set({ originalImage: base64, originalImageName: name, generatedImage: null }),

      setConfig: (partial) =>
        set((s) => ({ config: { ...s.config, ...partial } })),

      setGeneratedImage: (url, prompt, mock = false) =>
        set({ generatedImage: url, generatedPrompt: prompt, isMockResult: mock }),

      reset: () =>
        set({
          originalImage: null,
          originalImageName: null,
          config: { ...DEFAULT_CONFIG },
          generatedImage: null,
          generatedPrompt: null,
          isMockResult: false,
        }),
    }),
    {
      name: 'house-configurator',
      partialize: (s) => ({
        originalImage: s.originalImage,
        originalImageName: s.originalImageName,
        config: s.config,
        generatedImage: s.generatedImage,
        generatedPrompt: s.generatedPrompt,
        isMockResult: s.isMockResult,
      }),
    }
  )
);
