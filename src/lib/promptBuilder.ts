import type { HouseConfig, LightingOption, SeasonOption } from './types';
import { getColorOption } from './colorOptions';
import { FACADE_MATERIALS, ROOF_MATERIALS, LIGHTING_OPTIONS, SEASON_OPTIONS } from './materials';

export function buildPrompt(
  config: HouseConfig,
  lighting: LightingOption = 'day',
  season: SeasonOption = 'summer'
): string {
  const roof       = getColorOption('roof', config.roof);
  const facade     = getColorOption('facade', config.facade);
  const windows    = getColorOption('windows', config.windows);
  const door       = getColorOption('door', config.door);
  const facadeMat  = FACADE_MATERIALS.find((m) => m.id === config.facadeMaterial);
  const roofMat    = ROOF_MATERIALS.find((m) => m.id === config.roofMaterial);
  const lightOpt   = LIGHTING_OPTIONS.find((l) => l.id === lighting);
  const seasonOpt  = SEASON_OPTIONS.find((s) => s.id === season);

  const roofDesc    = `${roof?.promptName ?? config.roof} ${roofMat?.promptName ?? ''}`.trim();
  const facadeDesc  = `${facade?.promptName ?? config.facade} ${facadeMat?.promptName ?? ''}`.trim();
  const windowsDesc = windows?.promptName ?? config.windows;
  const doorDesc    = door?.promptName ?? config.door;

  return [
    `Photorealistic exterior house renovation photograph.`,
    `The house has a ${roofDesc} roof,`,
    `${facadeDesc} facade walls,`,
    `${windowsDesc} window frames and glazing,`,
    `and a ${doorDesc} front door.`,
    `Lighting: ${lightOpt?.promptName ?? 'bright daylight'}.`,
    `Season: ${seasonOpt?.promptName ?? 'summer'}.`,
    `Identical house structure, same camera angle, same perspective, same surrounding garden.`,
    `Only colors, materials and lighting changed — no structural modifications whatsoever.`,
    `Professional architectural photography, 8K resolution, ultra detailed, sharp focus.`,
  ].join(' ');
}

export function buildNegativePrompt(): string {
  return [
    'cartoon, illustration, painting, sketch, drawing, anime, 3d render, CGI,',
    'deformed, blurry, low quality, watermark, text, logo,',
    'different house, different building, different architecture, aerial view,',
    'removed windows, changed structure, added extensions, construction debris,',
    'people blocking view, cars in foreground, overexposed, underexposed.',
  ].join(' ');
}
