import type { HouseConfig } from './types';
import type { OfferteRegel } from './offerteTypes';
import { getColorOption } from './colorOptions';
import { FACADE_MATERIALS, ROOF_MATERIALS } from './materials';

export function buildRegelsFromConfig(config: HouseConfig): OfferteRegel[] {
  const regels: OfferteRegel[] = [];

  const roofColor   = getColorOption('roof', config.roof);
  const facadeColor = getColorOption('facade', config.facade);
  const windowColor = getColorOption('windows', config.windows);
  const doorColor   = getColorOption('door', config.door);
  const facadeMat   = FACADE_MATERIALS.find((m) => m.id === config.facadeMaterial);
  const roofMat     = ROOF_MATERIALS.find((m) => m.id === config.roofMaterial);

  const push = (omschrijving: string, detail: string, prijs: number) =>
    regels.push({
      id: Date.now().toString() + Math.random(),
      omschrijving,
      detail,
      eenheid: 'm²',
      aantal: 1,
      prijs,
      btw: 21,
    });

  push(
    'Dakrenovatie',
    `${roofMat?.label ?? ''} · ${roofColor?.label ?? ''} kleur`,
    0
  );

  push(
    'Gevelschilderwerk',
    `${facadeMat?.label ?? ''} · ${facadeColor?.label ?? ''} kleur`,
    0
  );

  push(
    'Raamkozijnen behandelen',
    `${windowColor?.label ?? ''} afwerking`,
    0
  );

  push(
    'Voordeur plaatsen / behandelen',
    `${doorColor?.label ?? ''} uitvoering`,
    0
  );

  return regels;
}
