export interface HouseConfig {
  roof: string;
  facade: string;
  windows: string;
  door: string;
}

export interface ColorOption {
  id: string;
  label: string;
  hex: string;
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
}

export interface GenerateResponse {
  imageUrl: string;
  prompt: string;
  mock?: boolean;
}
