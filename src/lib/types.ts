export interface HouseConfig {
  roof: string;
  facade: string;
  windows: string;
  door: string;
  facadeMaterial: string;
  roofMaterial: string;
}

export type LightingOption = 'day' | 'golden' | 'dusk' | 'night';
export type SeasonOption = 'spring' | 'summer' | 'autumn' | 'winter';

export interface ColorOption {
  id: string;
  label: string;
  hex: string;
  promptName: string;
}

export interface MaterialOption {
  id: string;
  label: string;
  icon: string;
  promptName: string;
}

export interface ElementConfig {
  id: keyof HouseConfig;
  label: string;
  icon: string;
  colors: ColorOption[];
}

export interface GenerateRequest {
  imageBase64: string;
  config: HouseConfig;
  lighting: LightingOption;
  season: SeasonOption;
}

export interface GenerateResponse {
  imageUrl: string;
  prompt: string;
  mock?: boolean;
}

export interface SavedVersion {
  id: string;
  imageUrl: string;
  config: HouseConfig;
  lighting: LightingOption;
  season: SeasonOption;
  label: string;
  createdAt: number;
}

export interface FavoriteCombo {
  id: string;
  label: string;
  config: HouseConfig;
}
