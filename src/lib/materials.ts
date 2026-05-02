import type { MaterialOption } from './types';

export const FACADE_MATERIALS: MaterialOption[] = [
  { id: 'plaster',   label: 'Pleisterwerk', icon: '🏛️',  promptName: 'smooth plaster render finish' },
  { id: 'brick',     label: 'Baksteen',     icon: '🧱',  promptName: 'exposed brick facade' },
  { id: 'wood',      label: 'Hout',         icon: '🪵',  promptName: 'horizontal wooden cladding boards' },
  { id: 'concrete',  label: 'Beton',        icon: '🪨',  promptName: 'raw concrete panels' },
  { id: 'composite', label: 'Composiet',    icon: '✨',  promptName: 'modern composite cladding panels' },
  { id: 'stone',     label: 'Natuursteen',  icon: '💎',  promptName: 'natural stone facade' },
];

export const ROOF_MATERIALS: MaterialOption[] = [
  { id: 'tiles',    label: 'Dakpannen',  icon: '🏠', promptName: 'ceramic roof tiles' },
  { id: 'slate',    label: 'Leien',      icon: '🪨', promptName: 'natural slate tiles' },
  { id: 'metal',    label: 'Zink/metaal',icon: '⚙️', promptName: 'standing seam metal roof' },
  { id: 'bitumen',  label: 'Bitumen',    icon: '⬛', promptName: 'flat bitumen roofing' },
  { id: 'thatch',   label: 'Riet',       icon: '🌾', promptName: 'traditional thatched roof' },
  { id: 'green',    label: 'Sedumdak',   icon: '🌿', promptName: 'green sedum living roof' },
];

export const LIGHTING_OPTIONS = [
  { id: 'day',    label: 'Dag',        icon: '☀️',  promptName: 'bright daylight, blue sky, sunny day' },
  { id: 'golden', label: 'Gouden uur', icon: '🌅',  promptName: 'golden hour warm sunlight, long shadows' },
  { id: 'dusk',   label: 'Schemering', icon: '🌆',  promptName: 'blue hour dusk, warm interior lights on' },
  { id: 'night',  label: 'Nacht',      icon: '🌙',  promptName: 'night photography, exterior lighting, dark sky' },
] as const;

export const SEASON_OPTIONS = [
  { id: 'spring', label: 'Lente',  icon: '🌸', promptName: 'spring, fresh green leaves, flowers in garden' },
  { id: 'summer', label: 'Zomer',  icon: '🌿', promptName: 'summer, lush green trees, bright sunshine' },
  { id: 'autumn', label: 'Herfst', icon: '🍂', promptName: 'autumn, orange and red leaves, warm atmosphere' },
  { id: 'winter', label: 'Winter', icon: '❄️', promptName: 'winter, bare trees, soft overcast light, frost' },
] as const;
