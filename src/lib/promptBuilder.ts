import type { HouseConfig } from './types';
import { getColorOption } from './colorOptions';

export function buildPrompt(config: HouseConfig): string {
  const roof = getColorOption('roof', config.roof);
  const facade = getColorOption('facade', config.facade);
  const windows = getColorOption('windows', config.windows);
  const door = getColorOption('door', config.door);

  const roofDesc = roof?.promptName ?? config.roof;
  const facadeDesc = facade?.promptName ?? config.facade;
  const windowsDesc = windows?.promptName ?? config.windows;
  const doorDesc = door?.promptName ?? config.door;

  return [
    `Photorealistic exterior house renovation photo.`,
    `The house has a ${roofDesc} roof,`,
    `${facadeDesc} painted facade walls,`,
    `${windowsDesc} window frames,`,
    `and a ${doorDesc} front door.`,
    `Same house structure, same camera angle, same perspective, same surroundings.`,
    `Only colors and materials changed. No structural modifications.`,
    `Professional real estate photography, golden hour lighting, 8K resolution, highly detailed.`,
  ].join(' ');
}

export function buildNegativePrompt(): string {
  return [
    'cartoon, illustration, painting, sketch, drawing, anime, 3d render,',
    'deformed, blurry, low quality, watermark, text,',
    'different house, different architecture, different angle, different perspective,',
    'new extensions, removed windows, changed structure, construction site,',
    'people, cars blocking view, harsh shadows, overexposed.',
  ].join(' ');
}
