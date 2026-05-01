import type { ElementConfig } from './types';

export const ELEMENTS: ElementConfig[] = [
  {
    id: 'roof',
    label: 'Dak',
    icon: '🏠',
    colors: [
      { id: 'anthracite', label: 'Antraciet', hex: '#2d2d2d', promptName: 'anthracite grey' },
      { id: 'black', label: 'Zwart', hex: '#111111', promptName: 'matte black' },
      { id: 'terracotta', label: 'Terracotta', hex: '#c1440e', promptName: 'terracotta red' },
      { id: 'slate', label: 'Leisteen', hex: '#4a5568', promptName: 'slate blue-grey' },
      { id: 'dark-brown', label: 'Donker bruin', hex: '#3d2b1f', promptName: 'dark chocolate brown' },
      { id: 'moss-green', label: 'Mosgroen', hex: '#4a5240', promptName: 'moss green' },
    ],
  },
  {
    id: 'facade',
    label: 'Gevel',
    icon: '🧱',
    colors: [
      { id: 'white', label: 'Wit', hex: '#f5f5f0', promptName: 'crisp white' },
      { id: 'cream', label: 'Crème', hex: '#f0e8d0', promptName: 'warm cream' },
      { id: 'light-grey', label: 'Lichtgrijs', hex: '#d4d4d4', promptName: 'light grey' },
      { id: 'charcoal', label: 'Antraciet', hex: '#3a3a3a', promptName: 'dark charcoal' },
      { id: 'sand', label: 'Zand', hex: '#c8b89a', promptName: 'sandy beige' },
      { id: 'sage', label: 'Salie groen', hex: '#8fa88a', promptName: 'sage green' },
      { id: 'brick-red', label: 'Baksteenrood', hex: '#9e4a2d', promptName: 'deep brick red' },
      { id: 'navy', label: 'Donkerblauw', hex: '#1e2d4a', promptName: 'navy blue' },
    ],
  },
  {
    id: 'windows',
    label: 'Ramen',
    icon: '🪟',
    colors: [
      { id: 'anthracite', label: 'Antraciet', hex: '#3d3d3d', promptName: 'anthracite grey' },
      { id: 'white', label: 'Wit', hex: '#f0f0f0', promptName: 'bright white' },
      { id: 'black', label: 'Zwart', hex: '#1a1a1a', promptName: 'matte black' },
      { id: 'brown', label: 'Bruin', hex: '#6b4c2a', promptName: 'warm brown' },
      { id: 'bronze', label: 'Brons', hex: '#7d5a3c', promptName: 'bronze' },
    ],
  },
  {
    id: 'door',
    label: 'Voordeur',
    icon: '🚪',
    colors: [
      { id: 'black', label: 'Zwart', hex: '#1a1a1a', promptName: 'matte black' },
      { id: 'oak', label: 'Eiken', hex: '#8b6914', promptName: 'natural oak wood' },
      { id: 'white', label: 'Wit', hex: '#f0f0f0', promptName: 'bright white' },
      { id: 'red', label: 'Rood', hex: '#8b1a1a', promptName: 'deep red' },
      { id: 'navy', label: 'Marineblauw', hex: '#1a2a4a', promptName: 'navy blue' },
      { id: 'forest-green', label: 'Bosgroen', hex: '#1a3a2a', promptName: 'forest green' },
      { id: 'walnut', label: 'Walnoot', hex: '#4a2c0a', promptName: 'dark walnut wood' },
    ],
  },
];

export const DEFAULT_CONFIG = {
  roof: 'anthracite',
  facade: 'white',
  windows: 'anthracite',
  door: 'black',
};

export function getColorOption(elementId: keyof typeof DEFAULT_CONFIG, colorId: string) {
  const element = ELEMENTS.find((e) => e.id === elementId);
  return element?.colors.find((c) => c.id === colorId);
}
