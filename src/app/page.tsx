'use client';

import React, { useState, useCallback, useRef } from 'react';


/* ================================================================
   TYPES
   ================================================================ */
type Step = 1 | 2 | 3 | 'loading' | 'result';

interface Config {
  dak: {
    type: string | null;
    bedekking: string | null;
    kleur: string | null;
    extras: string[];
    zonnepanelen: string | null;
    dakkapel: string | null;
    dakgoot: string | null;
  };
  gevel: {
    afwerking: string | null;
    gevels: string[];
    kleur: string | null;
    extras: string[];
    ramen: string | null;
    deur: string | null;
    deurkleur: string | null;
  };
}
interface Scopes { dak: boolean; gevel: boolean; }

/* ================================================================
   OPTIONS
   ================================================================ */
const DAK_TYPES = ['Zadeldak', 'Plat dak', 'Schilddak', 'Mansardedak', 'Tentdak', 'Lessenaarsdak', 'Vlinderdak'];
const DAK_BEDEKKING = ['Dakpannen', 'Leien', 'EPDM', 'Roofing/bitumen', 'Metalen dakpanelen', 'Groendak', 'Zink', 'Keramische pannen', 'Betonpannen'];
const DAK_KLEUREN = [
  { name: 'Antraciet', hex: '#2d3033' },
  { name: 'Zwart', hex: '#0e0e0e' },
  { name: 'Roodbruin', hex: '#7d3a25' },
  { name: 'Donkergrijs', hex: '#7a7d80' },
  { name: 'Terracotta', hex: '#b85c3a' },
  { name: 'Leisteengrijs', hex: '#4a5568' },
  { name: 'Bruin', hex: '#6b4226' },
  { name: 'Groengrijs', hex: '#4a5e52' },
  { name: 'Rood', hex: '#9b2335' },
  { name: 'Naturel', hex: '#c4a882' },
];
const DAK_EXTRAS = [
  'Dakgoten vervangen', 'Isolatie toevoegen', 'Dakkapel toevoegen',
  'Dakraam toevoegen', 'Schoorstenen behouden', 'Regenwaterput',
  'Zonneboiler integreren', 'Ventilatieopeningen',
];
const DAK_ZONNEPANELEN = ['Geen', '4 panelen', '6 panelen', '8 panelen', '10 panelen', '12 panelen', '16 panelen', '20+ panelen'];
const DAK_KAPEL = ['Geen dakkapel', 'Kleine dakkapel', 'Grote dakkapel', 'Dakkapel met terras', 'Meerdere dakkapellen'];
const DAK_GOOT = ['Zink', 'Aluminium', 'PVC', 'Koper', 'Staal'];

const GEVEL_AFWERKING = ['Crepi', 'Gevelpleister', 'Houten gevelbekleding', 'Steenstrips', 'Gevelpanelen', 'Schilderwerk', 'Baksteen', 'Natuursteen', 'Composiet', 'Betonlook'];
const GEVEL_GEVELS = ['Voorgevel', 'Achtergevel', 'Linkergevel', 'Rechtergevel', 'Alle gevels'];
const GEVEL_KLEUREN = [
  { name: 'Wit', hex: '#f5f2ea' },
  { name: 'Crème', hex: '#ede4d3' },
  { name: 'Lichtgrijs', hex: '#cccdc8' },
  { name: 'Donkergrijs', hex: '#5a5d60' },
  { name: 'Antraciet', hex: '#2d3033' },
  { name: 'Beige', hex: '#c8b89a' },
  { name: 'Zandkleur', hex: '#d8c79e' },
  { name: 'Taupe', hex: '#b5a898' },
  { name: 'Olijfgroen', hex: '#6b7c5c' },
  { name: 'Terracotta', hex: '#c8553d' },
  { name: 'Okergeel', hex: '#d4a843' },
  { name: 'Zwart', hex: '#1a1a1a' },
];
const GEVEL_EXTRAS = [
  'Gevelisolatie toevoegen', 'Raamomlijsting behouden', 'Plint behouden',
  'Regenpijpen behouden', 'Luiken toevoegen', 'Rolluiken toevoegen',
  'Terrasoverkapping', 'Carport toevoegen',
];
const GEVEL_RAMEN = ['Huidig behouden', 'Houten ramen', 'PVC ramen wit', 'PVC ramen zwart', 'Aluminium ramen', 'Stalen ramen', 'Panoramaramen'];
const GEVEL_DEUR = ['Huidig behouden', 'Voordeur klassiek', 'Voordeur modern', 'Voordeur staal', 'Voordeur hout', 'Draaideuren', 'Schuifdeuren'];
const GEVEL_DEURKLEUREN = [
  { name: 'Zwart', hex: '#1a1a1a' },
  { name: 'Antraciet', hex: '#2d3033' },
  { name: 'Wit', hex: '#f5f2ea' },
  { name: 'Bordeaux', hex: '#6b2737' },
  { name: 'Donkerblauw', hex: '#1e3a5f' },
  { name: 'Groen', hex: '#2d5016' },
  { name: 'Houtkleur', hex: '#8b5e3c' },
  { name: 'Geel', hex: '#d4a017' },
];

const defaultConfig = (): Config => ({
  dak: { type: null, bedekking: null, kleur: null, extras: [], zonnepanelen: null, dakkapel: null, dakgoot: null },
  gevel: { afwerking: null, gevels: [], kleur: null, extras: [], ramen: null, deur: null, deurkleur: null },
});

/* ================================================================
   PROMPT BUILDER — Dutch → English AI descriptions
   ================================================================ */
const COLOR_EN: Record<string, string> = {
  'Antraciet': 'anthracite dark gray',
  'Zwart': 'matte black',
  'Roodbruin': 'reddish brown',
  'Donkergrijs': 'dark charcoal gray',
  'Grijs': 'medium gray',
  'Terracotta': 'terracotta red-orange',
  'Leisteengrijs': 'slate gray',
  'Bruin': 'warm chestnut brown',
  'Groengrijs': 'gray-green',
  'Rood': 'brick red',
  'Naturel': 'natural sandy beige',
  'Wit': 'pure white',
  'Crème': 'cream off-white',
  'Lichtgrijs': 'light silver gray',
  'Beige': 'warm beige',
  'Zandkleur': 'sandy beige',
  'Taupe': 'warm taupe',
  'Olijfgroen': 'olive green',
  'Okergeel': 'ochre yellow',
  'Bordeaux': 'deep bordeaux red',
  'Donkerblauw': 'deep navy blue',
  'Groen': 'dark forest green',
  'Houtkleur': 'natural wood brown',
  'Geel': 'golden yellow',
};

const MATERIAL_EN: Record<string, string> = {
  // Dak
  'Dakpannen': 'clay roof tiles',
  'Leien': 'natural slate tiles',
  'EPDM': 'flat EPDM rubber roof',
  'Roofing/bitumen': 'bitumen flat roofing',
  'Metalen dakpanelen': 'standing seam metal roof panels',
  'Groendak': 'green living sedum roof',
  'Zink': 'zinc roofing',
  'Keramische pannen': 'ceramic roof tiles',
  'Betonpannen': 'concrete roof tiles',
  // Gevel
  'Crepi': 'textured render (crepi) exterior finish',
  'Gevelpleister': 'smooth exterior plaster',
  'Houten gevelbekleding': 'horizontal wood cladding',
  'Steenstrips': 'thin brick slips veneer',
  'Gevelpanelen': 'flat facade composite panels',
  'Schilderwerk': 'painted exterior walls',
  'Baksteen': 'exposed facing brick',
  'Natuursteen': 'natural stone cladding',
  'Composiet': 'composite cladding boards',
  'Betonlook': 'concrete-look exterior panels',
};

const RAMEN_EN: Record<string, string> = {
  'Houten ramen': 'wooden window frames',
  'PVC ramen wit': 'white PVC window frames',
  'PVC ramen zwart': 'black PVC window frames',
  'Aluminium ramen': 'slim aluminum window frames',
  'Stalen ramen': 'steel-look window frames',
  'Panoramaramen': 'large panoramic windows',
};

const DEUR_EN: Record<string, string> = {
  'Voordeur klassiek': 'classic panel front door',
  'Voordeur modern': 'modern flat-panel front door',
  'Voordeur staal': 'industrial steel front door',
  'Voordeur hout': 'solid wood front door',
  'Draaideuren': 'pivot front door',
  'Schuifdeuren': 'sliding glass entry doors',
};

const DAK_TYPE_EN: Record<string, string> = {
  'Zadeldak': 'gable roof',
  'Plat dak': 'flat roof',
  'Schilddak': 'hip roof',
  'Mansardedak': 'mansard roof',
  'Tentdak': 'pyramid hip roof',
  'Lessenaarsdak': 'mono-pitch lean-to roof',
  'Vlinderdak': 'butterfly roof',
};

function c(name: string | null) { return name ? (COLOR_EN[name] ?? name) : null; }
function m(name: string | null) { return name ? (MATERIAL_EN[name] ?? name) : null; }

function buildRichPrompt(config: Config, scopes: Scopes): string {
  const lines: string[] = [
    'Photorealistic exterior house renovation photograph.',
    'Keep the identical house structure, same camera angle, same perspective, same garden and street.',
    'Apply only these specific renovation changes:',
  ];

  if (scopes.dak) {
    const d = config.dak;
    const dakParts: string[] = [];
    if (d.type) dakParts.push(DAK_TYPE_EN[d.type] ?? d.type);
    if (d.bedekking) dakParts.push(`covered with ${m(d.bedekking)}`);
    if (d.kleur) dakParts.push(`in ${c(d.kleur)} color`);
    if (d.zonnepanelen && d.zonnepanelen !== 'Geen') dakParts.push(`with ${d.zonnepanelen} solar panels mounted flush on the roof surface`);
    if (d.dakkapel && d.dakkapel !== 'Geen dakkapel') dakParts.push(`with a ${d.dakkapel.toLowerCase()} integrated into the roof`);
    if (d.dakgoot) dakParts.push(`${d.dakgoot.toLowerCase()} gutters`);
    if (dakParts.length > 0) lines.push(`Roof: ${dakParts.join(', ')}.`);
    if (d.extras.length > 0) {
      const extrasEn = d.extras.map(e => e === 'Isolatie toevoegen' ? 'roof insulation added' : e === 'Dakraam toevoegen' ? 'skylight window in roof' : e).join(', ');
      lines.push(`Roof extras: ${extrasEn}.`);
    }
  }

  if (scopes.gevel) {
    const g = config.gevel;
    const gevelParts: string[] = [];
    if (g.afwerking) gevelParts.push(m(g.afwerking) ?? g.afwerking);
    if (g.kleur) gevelParts.push(`painted ${c(g.kleur)}`);
    if (g.gevels.length > 0 && !g.gevels.includes('Alle gevels')) gevelParts.push(`applied to ${g.gevels.join(', ').toLowerCase()}`);
    if (gevelParts.length > 0) lines.push(`Facade: ${gevelParts.join(', ')}.`);
    if (g.ramen && g.ramen !== 'Huidig behouden') lines.push(`Windows: replaced with ${RAMEN_EN[g.ramen] ?? g.ramen}.`);
    if (g.deur && g.deur !== 'Huidig behouden') {
      const deurDesc = DEUR_EN[g.deur] ?? g.deur;
      const kleurDesc = g.deurkleur ? ` in ${c(g.deurkleur)} color` : '';
      lines.push(`Front door: ${deurDesc}${kleurDesc}.`);
    } else if (g.deurkleur) {
      lines.push(`Front door repainted ${c(g.deurkleur)}.`);
    }
    if (g.extras.length > 0) lines.push(`Facade extras: ${g.extras.join(', ')}.`);
  }

  lines.push(
    'Negative: do NOT change house shape, structure, windows layout, or add elements not specified.',
    'Professional architectural photography, 8K resolution, ultra detailed, sharp focus, natural daylight.',
  );

  return lines.join(' ');
}

/* ================================================================
   DESIGN TOKENS
   ================================================================ */
const T = {
  bg: '#f5f3ee',
  surface: '#ffffff',
  ink: '#1a1d1f',
  inkSoft: '#4a5056',
  inkMuted: '#8a9099',
  line: '#e6e2d9',
  lineStrong: '#d4cebf',
  accent: '#c8553d',
  accentSoft: '#f4e4dd',
  accentDeep: '#a13d27',
};

const font = "'Inter Tight', system-ui, sans-serif";
const serif = "'Fraunces', Georgia, serif";

/* ================================================================
   SMALL REUSABLE COMPONENTS
   ================================================================ */

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 14px', borderRadius: 100, fontSize: 14, fontWeight: 500,
      border: `1px solid ${selected ? T.ink : T.lineStrong}`,
      background: selected ? T.ink : T.surface,
      color: selected ? T.bg : T.inkSoft,
      cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: font,
    }}>
      {label}
    </button>
  );
}

function ColorSwatch({ name, hex, selected, onClick }: { name: string; hex: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      border: `2px solid ${selected ? T.accent : 'transparent'}`,
      borderRadius: 8, padding: 6,
      background: selected ? T.accentSoft : T.bg,
      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease',
    }}>
      <div style={{ width: '100%', aspectRatio: '1', borderRadius: 4, background: hex, marginBottom: 6, border: '1px solid rgba(0,0,0,0.08)' }} />
      <div style={{ fontSize: 12, color: selected ? T.ink : T.inkSoft, fontWeight: selected ? 600 : 500, fontFamily: font }}>{name}</div>
    </button>
  );
}

function PicTile({ svg, label, selected, onClick }: { svg: React.ReactNode; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 6, padding: '12px 6px 10px', borderRadius: 14, cursor: 'pointer',
      border: `2px solid ${selected ? T.accent : T.line}`,
      background: selected ? T.accentSoft : T.surface,
      transition: 'all 0.15s ease',
    }}>
      <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{svg}</div>
      <span style={{ fontSize: 11, fontWeight: 600, color: selected ? T.accentDeep : T.inkSoft, fontFamily: font, textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
    </button>
  );
}

/* SVG icon helpers */
const SvgNone = () => (
  <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
    <circle cx="24" cy="24" r="19" stroke="#d4cebf" strokeWidth="2"/>
    <line x1="13" y1="13" x2="35" y2="35" stroke="#d4cebf" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

function SolarGrid({ cols, rows, badge }: { cols: number; rows: number; badge?: string }) {
  const gap = 2, vw = 48, vh = 44;
  const pw = (vw - gap * (cols - 1)) / cols;
  const ph = (vh - gap * (rows - 1)) / rows;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * (pw + gap), y = 2 + r * (ph + gap);
      cells.push(
        <g key={`${r}-${c}`}>
          <rect x={x} y={y} width={pw} height={ph} rx="1" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.2"/>
          <line x1={x + pw / 2} y1={y} x2={x + pw / 2} y2={y + ph} stroke="#3b82f6" strokeWidth="0.6"/>
          <line x1={x} y1={y + ph / 2} x2={x + pw} y2={y + ph / 2} stroke="#3b82f6" strokeWidth="0.6"/>
        </g>
      );
    }
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
      {cells}
      {badge && <text x="24" y="47" textAnchor="middle" fontSize="7" fill="#1d4ed8" fontWeight="700">{badge}</text>}
    </svg>
  );
}

function RoofSvg({ dormer }: { dormer?: 'small' | 'large' | 'terrace' | 'double' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
      <rect x="6" y="32" width="36" height="13" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="1.5"/>
      <path d="M3 32L24 10L45 32Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.5" strokeLinejoin="round"/>
      {dormer === 'small' && <>
        <path d="M17 24L24 17L31 24Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.2"/>
        <rect x="17" y="24" width="14" height="8" fill="#dbeafe" stroke="#1a1d1f" strokeWidth="1.2"/>
      </>}
      {dormer === 'large' && <>
        <path d="M12 24L24 14L36 24Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.2"/>
        <rect x="12" y="24" width="24" height="8" fill="#dbeafe" stroke="#1a1d1f" strokeWidth="1.2"/>
      </>}
      {dormer === 'terrace' && <>
        <path d="M11 23L24 13L37 23Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.2"/>
        <rect x="11" y="23" width="26" height="9" fill="#dbeafe" stroke="#1a1d1f" strokeWidth="1.2"/>
        <line x1="11" y1="32" x2="37" y2="32" stroke="#1a1d1f" strokeWidth="1.5"/>
        {[15, 21, 27, 33].map(cx => <line key={cx} x1={cx} y1="29" x2={cx} y2="32" stroke="#1a1d1f" strokeWidth="1"/>)}
      </>}
      {dormer === 'double' && <>
        <path d="M7 27L14 20L21 27Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.1"/>
        <rect x="7" y="27" width="14" height="5" fill="#dbeafe" stroke="#1a1d1f" strokeWidth="1.1"/>
        <path d="M27 27L34 20L41 27Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.1"/>
        <rect x="27" y="27" width="14" height="5" fill="#dbeafe" stroke="#1a1d1f" strokeWidth="1.1"/>
      </>}
    </svg>
  );
}

function WindowSvg({ type }: { type: 'neutral' | 'hout' | 'pvc-wit' | 'pvc-zwart' | 'alu' | 'staal' | 'panorama' }) {
  const cfg: Record<string, { stroke: string; fw: number; fill: string; extra?: boolean }> = {
    neutral:    { stroke: '#9ca3af', fw: 2,   fill: '#e8f4fd' },
    hout:       { stroke: '#8b5e3c', fw: 4,   fill: '#e8d5b7' },
    'pvc-wit':  { stroke: '#d1d5db', fw: 2.5, fill: '#f0f8ff' },
    'pvc-zwart':{ stroke: '#1f2937', fw: 2.5, fill: '#e8f4fd' },
    alu:        { stroke: '#9ca3af', fw: 1,   fill: '#e8f4fd' },
    staal:      { stroke: '#374151', fw: 2,   fill: '#e8f4fd', extra: true },
    panorama:   { stroke: '#374151', fw: 2,   fill: '#e8f4fd' },
  };
  const { stroke, fw, fill, extra } = cfg[type] ?? cfg.neutral;
  if (type === 'panorama') return (
    <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
      <rect x="2" y="14" width="44" height="22" rx="1" fill={fill} stroke={stroke} strokeWidth={fw}/>
      <line x1="17" y1="14" x2="17" y2="36" stroke={stroke} strokeWidth={fw * 0.7}/>
      <line x1="31" y1="14" x2="31" y2="36" stroke={stroke} strokeWidth={fw * 0.7}/>
    </svg>
  );
  return (
    <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
      <rect x="6" y="6" width="36" height="36" rx="1" fill={fill} stroke={stroke} strokeWidth={fw}/>
      <line x1="24" y1="6" x2="24" y2="42" stroke={stroke} strokeWidth={fw * 0.6}/>
      <line x1="6" y1="24" x2="42" y2="24" stroke={stroke} strokeWidth={fw * 0.6}/>
      {extra && <>
        <line x1="15" y1="6" x2="15" y2="42" stroke={stroke} strokeWidth="0.8"/>
        <line x1="33" y1="6" x2="33" y2="42" stroke={stroke} strokeWidth="0.8"/>
      </>}
    </svg>
  );
}

function DoorSvg({ type }: { type: 'neutral' | 'klassiek' | 'modern' | 'staal' | 'hout' | 'draai' | 'schuif' }) {
  const dx = 12, dy = 4, dw = 24, dh = 40;
  if (type === 'klassiek') return (
    <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
      <rect x={dx} y={dy} width={dw} height={dh} rx="1" fill="#f5efe6" stroke="#1a1d1f" strokeWidth="2"/>
      <rect x={dx+3} y={dy+4} width={dw-6} height={15} rx="1" stroke="#1a1d1f" strokeWidth="1"/>
      <rect x={dx+3} y={dy+23} width={dw-6} height={14} rx="1" stroke="#1a1d1f" strokeWidth="1"/>
      <circle cx={dx+dw-5} cy={dy+dh/2} r="2" fill="#c8553d"/>
    </svg>
  );
  if (type === 'modern') return (
    <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
      <rect x={dx} y={dy} width={dw} height={dh} rx="2" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="2"/>
      <line x1={dx+5} y1={dy+6} x2={dx+5} y2={dy+dh-6} stroke="#c8553d" strokeWidth="2.5"/>
      <line x1={dx+dw-6} y1={dy+dh/2-7} x2={dx+dw-6} y2={dy+dh/2+7} stroke="#1a1d1f" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
  if (type === 'staal') return (
    <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
      <rect x={dx} y={dy} width={dw} height={dh} fill="#4b5563" stroke="#374151" strokeWidth="2"/>
      {[10,20,30].map(offset => <line key={offset} x1={dx+2} y1={dy+offset} x2={dx+dw-2} y2={dy+offset} stroke="#6b7280" strokeWidth="1.5"/>)}
      <circle cx={dx+dw-5} cy={dy+dh/2} r="2.5" fill="#9ca3af"/>
    </svg>
  );
  if (type === 'hout') return (
    <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
      <rect x={dx} y={dy} width={dw} height={dh} rx="1" fill="#c4935a" stroke="#7c4e1e" strokeWidth="2"/>
      {[8,16].map(offset => <line key={offset} x1={dx+offset} y1={dy+2} x2={dx+offset} y2={dy+dh-2} stroke="#7c4e1e" strokeWidth="1.2"/>)}
      <circle cx={dx+dw-5} cy={dy+dh/2} r="2" fill="#1a1d1f"/>
    </svg>
  );
  if (type === 'draai') return (
    <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
      <rect x={dx} y={dy} width={dw} height={dh} stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeDasharray="3 2"/>
      <path d={`M${dx} ${dy} L${dx+dw-3} ${dy+4} L${dx+dw-3} ${dy+dh-4} L${dx} ${dy+dh}Z`} fill="#f0ede8" stroke="#1a1d1f" strokeWidth="2"/>
      <line x1={dx} y1={dy} x2={dx} y2={dy+dh} stroke="#c8553d" strokeWidth="2"/>
      <line x1={dx+dw-10} y1={dy+dh/2-6} x2={dx+dw-10} y2={dy+dh/2+6} stroke="#1a1d1f" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
  if (type === 'schuif') return (
    <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
      <line x1="4" y1="6" x2="44" y2="6" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round"/>
      <rect x={dx} y="6" width={dw} height={dh} rx="1" fill="#dbeafe" stroke="#374151" strokeWidth="2"/>
      <line x1="24" y1="8" x2="24" y2={6+dh-2} stroke="#374151" strokeWidth="1.2"/>
      <circle cx="14" cy="6" r="3" fill="#d4cebf" stroke="#9ca3af" strokeWidth="1"/>
      <circle cx="34" cy="6" r="3" fill="#d4cebf" stroke="#9ca3af" strokeWidth="1"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
      <rect x={dx} y={dy} width={dw} height={dh} rx="1" fill="#f5f3ee" stroke="#9ca3af" strokeWidth="1.5"/>
      <line x1="24" y1={dy+2} x2="24" y2={dy+dh-2} stroke="#9ca3af" strokeWidth="1"/>
      <circle cx={dx+dw-5} cy={dy+dh/2} r="1.5" fill="#9ca3af"/>
    </svg>
  );
}

function CheckTile({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
      border: `1px solid ${selected ? T.accent : T.lineStrong}`,
      borderRadius: 8, cursor: 'pointer',
      background: selected ? T.accentSoft : T.surface,
      transition: 'all 0.15s ease', textAlign: 'left', width: '100%',
    }}>
      <span style={{
        width: 18, height: 18, border: `1.5px solid ${selected ? T.accent : T.lineStrong}`,
        borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? T.accent : T.surface, color: 'white', fontSize: 11, fontWeight: 700,
      }}>
        {selected && '✓'}
      </span>
      <span style={{ fontSize: 14, color: T.ink, fontWeight: 500, fontFamily: font }}>{label}</span>
    </button>
  );
}

function StepHeader({ eyebrow, title, subtitle, green }: { eyebrow: string; title: string; subtitle?: string; green?: boolean }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 40 }}>
      <span style={{
        display: 'inline-block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em',
        color: green ? '#1a4a2e' : T.accentDeep,
        background: green ? '#d1f5e0' : T.accentSoft,
        padding: '5px 12px', borderRadius: 100, marginBottom: 16, fontWeight: 600, fontFamily: font,
      }}>
        {eyebrow}
      </span>
      <h1 style={{ fontFamily: serif, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, lineHeight: 1.1, marginBottom: 12, color: T.ink }}>
        {title}
      </h1>
      {subtitle && <p style={{ fontSize: 16, color: T.inkSoft, maxWidth: 520, margin: '0 auto', fontFamily: font }}>{subtitle}</p>}
    </div>
  );
}

function ConfigSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 20, padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ width: 36, height: 36, background: T.ink, color: T.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 500, color: T.ink, margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ConfigGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.inkMuted, fontWeight: 600, marginBottom: 10, fontFamily: font }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ================================================================
   STEP 1 — UPLOAD
   ================================================================ */
function Step1Upload({
  onFile, error, isDragging, setIsDragging, fileRef,
}: {
  onFile: (f: File) => void;
  error: string;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Stap 1 van 3"
        title="Upload een foto van het pand"
        subtitle="Begin met een duidelijke foto van de woning, het dak of de gevel die je wil visualiseren."
      />

      <label
        style={{
          display: 'block',
          background: isDragging ? T.accentSoft : T.surface,
          border: `2px dashed ${isDragging ? T.accent : T.lineStrong}`,
          borderRadius: 28, padding: '80px 40px', textAlign: 'center',
          cursor: 'pointer', transition: 'all 0.25s ease',
        }}
        onDragEnter={e => { e.preventDefault(); setIsDragging(true); }}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
        onDrop={e => {
          e.preventDefault(); setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) onFile(file);
        }}
      >
        <input
          ref={fileRef as React.LegacyRef<HTMLInputElement>}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        />
        <div style={{ width: 72, height: 72, background: T.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={T.ink} strokeWidth="1.5">
            <path d="M12 16V4M12 4L7 9M12 4l5 5M5 20h14" />
          </svg>
        </div>
        <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 500, marginBottom: 8, color: T.ink }}>
          Sleep een foto hierheen of klik om te uploaden
        </div>
        <div style={{ color: T.inkSoft, fontSize: 15, marginBottom: 24, fontFamily: font }}>
          Upload een foto van de woning, het dak of de gevel.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {['JPG', 'PNG', 'WEBP'].map(f => (
            <span key={f} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px', background: T.bg, color: T.inkMuted, borderRadius: 4, fontWeight: 600, fontFamily: font }}>{f}</span>
          ))}
        </div>
        {error && <p style={{ color: '#c53030', marginTop: 16, fontSize: 14, fontFamily: font }}>{error}</p>}
      </label>

      {/* Tips */}
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { n: '1', title: 'Daglicht werkt het beste', desc: 'Vermijd schaduw of tegenlicht voor de duidelijkste resultaten.' },
          { n: '2', title: 'Frontaal perspectief', desc: 'Maak de foto recht voor het pand, niet vanaf een steile hoek.' },
          { n: '3', title: 'Gevel of dak volledig zichtbaar', desc: 'Knip niets weg dat je later wil bewerken.' },
        ].map(tip => (
          <div key={tip.n} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 24, height: 24, background: T.accentSoft, color: T.accentDeep, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: font }}>
              {tip.n}
            </div>
            <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.4, fontFamily: font }}>
              <strong style={{ color: T.ink, fontWeight: 600, display: 'block', marginBottom: 2 }}>{tip.title}</strong>
              {tip.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   STEP 2 — SCOPE + QUICK VISUAL OPTIONS (always visible)
   ================================================================ */
function Step2Scope({
  photoUrl, scopes, config, onToggle, onDakChange, onGevelChange, onBack, onNext,
}: {
  photoUrl: string;
  scopes: Scopes;
  config: Config;
  onToggle: (s: keyof Scopes) => void;
  onDakChange: <K extends keyof Config['dak']>(field: K, value: Config['dak'][K]) => void;
  onGevelChange: <K extends keyof Config['gevel']>(field: K, value: Config['gevel'][K]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const anySelected = scopes.dak || scopes.gevel;

  const optGroup = (label: string, children: React.ReactNode) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.inkMuted, marginBottom: 10, fontFamily: font }}>{label}</div>
      {children}
    </div>
  );

  return (
    <div>
      <StepHeader
        eyebrow="Stap 2 van 3"
        title="Wat wil je aanpassen?"
        subtitle="Kies dak, gevel of beide — en stel direct de opties in."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28, alignItems: 'start' }}>

        {/* LEFT — sticky photo */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{ background: T.surface, borderRadius: 20, padding: 16, border: `1px solid ${T.line}` }}>
            <img src={photoUrl} alt="Jouw foto" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8, display: 'block' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: 11, fontFamily: font }}>Jouw foto</span>
              <button onClick={onBack} style={{ color: T.accentDeep, fontWeight: 500, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: font }}>Wijzigen</button>
            </div>
          </div>
        </div>

        {/* RIGHT — accordion: click header → options expand inline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* DAK accordion */}
          <div style={{
            background: T.surface, border: `2px solid ${scopes.dak ? T.accent : T.line}`,
            borderRadius: 20, overflow: 'hidden', transition: 'border-color 0.2s ease',
          }}>
            <button onClick={() => onToggle('dak')} style={{
              width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: scopes.dak ? T.accentSoft : 'transparent', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, background: scopes.dak ? T.surface : T.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 44 44" fill="none" width="36" height="36">
                    <path d="M4 22L22 6L40 22" stroke="#1a1d1f" strokeWidth="2" strokeLinejoin="round"/>
                    <rect x="6" y="22" width="32" height="16" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="1.8"/>
                    <rect x="17" y="28" width="10" height="10" fill="#dbeafe" stroke="#1a1d1f" strokeWidth="1.4"/>
                    <path d="M4 22L22 6L40 22" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.8" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: serif, fontSize: 19, fontWeight: 500, color: T.ink }}>Dak</div>
                  <div style={{ fontSize: 13, color: T.inkSoft, fontFamily: font }}>Zonnepanelen, dakkapel en meer</div>
                </div>
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${scopes.dak ? T.accent : T.lineStrong}`,
                background: scopes.dak ? T.accent : T.surface,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 13, fontWeight: 700,
              }}>
                {scopes.dak ? '✓' : '+'}
              </div>
            </button>
            {scopes.dak && (
              <div style={{ padding: '20px 24px 24px', borderTop: `1px solid ${T.line}` }}>
                {optGroup('Zonnepanelen',
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    <PicTile svg={<SvgNone/>} label="Geen" selected={config.dak.zonnepanelen === 'Geen'} onClick={() => onDakChange('zonnepanelen', 'Geen')}/>
                    <PicTile svg={<SolarGrid cols={2} rows={2}/>} label="4" selected={config.dak.zonnepanelen === '4 panelen'} onClick={() => onDakChange('zonnepanelen', '4 panelen')}/>
                    <PicTile svg={<SolarGrid cols={3} rows={2}/>} label="6" selected={config.dak.zonnepanelen === '6 panelen'} onClick={() => onDakChange('zonnepanelen', '6 panelen')}/>
                    <PicTile svg={<SolarGrid cols={4} rows={2}/>} label="8" selected={config.dak.zonnepanelen === '8 panelen'} onClick={() => onDakChange('zonnepanelen', '8 panelen')}/>
                    <PicTile svg={<SolarGrid cols={3} rows={3} badge="10"/>} label="10" selected={config.dak.zonnepanelen === '10 panelen'} onClick={() => onDakChange('zonnepanelen', '10 panelen')}/>
                    <PicTile svg={<SolarGrid cols={3} rows={3} badge="12"/>} label="12" selected={config.dak.zonnepanelen === '12 panelen'} onClick={() => onDakChange('zonnepanelen', '12 panelen')}/>
                    <PicTile svg={<SolarGrid cols={4} rows={3} badge="16"/>} label="16" selected={config.dak.zonnepanelen === '16 panelen'} onClick={() => onDakChange('zonnepanelen', '16 panelen')}/>
                    <PicTile svg={<SolarGrid cols={4} rows={3} badge="20+"/>} label="20+" selected={config.dak.zonnepanelen === '20+ panelen'} onClick={() => onDakChange('zonnepanelen', '20+ panelen')}/>
                  </div>
                )}
                {optGroup('Dakkapel',
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    <PicTile svg={<RoofSvg/>} label="Geen" selected={config.dak.dakkapel === 'Geen dakkapel'} onClick={() => onDakChange('dakkapel', 'Geen dakkapel')}/>
                    <PicTile svg={<RoofSvg dormer="small"/>} label="Klein" selected={config.dak.dakkapel === 'Kleine dakkapel'} onClick={() => onDakChange('dakkapel', 'Kleine dakkapel')}/>
                    <PicTile svg={<RoofSvg dormer="large"/>} label="Groot" selected={config.dak.dakkapel === 'Grote dakkapel'} onClick={() => onDakChange('dakkapel', 'Grote dakkapel')}/>
                    <PicTile svg={<RoofSvg dormer="terrace"/>} label="Terras" selected={config.dak.dakkapel === 'Dakkapel met terras'} onClick={() => onDakChange('dakkapel', 'Dakkapel met terras')}/>
                    <PicTile svg={<RoofSvg dormer="double"/>} label="Meerdere" selected={config.dak.dakkapel === 'Meerdere dakkapellen'} onClick={() => onDakChange('dakkapel', 'Meerdere dakkapellen')}/>
                  </div>
                )}
                {optGroup('Kleur dak',
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    {DAK_KLEUREN.map(c => (
                      <ColorSwatch key={c.name} name={c.name} hex={c.hex} selected={config.dak.kleur === c.name} onClick={() => onDakChange('kleur', c.name)}/>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GEVEL accordion */}
          <div style={{
            background: T.surface, border: `2px solid ${scopes.gevel ? T.accent : T.line}`,
            borderRadius: 20, overflow: 'hidden', transition: 'border-color 0.2s ease',
          }}>
            <button onClick={() => onToggle('gevel')} style={{
              width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: scopes.gevel ? T.accentSoft : 'transparent', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, background: scopes.gevel ? T.surface : T.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 44 44" fill="none" width="36" height="36">
                    <rect x="4" y="4" width="36" height="36" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="1.8" rx="1"/>
                    <rect x="9" y="9" width="10" height="8" fill="#dbeafe" stroke="#1a1d1f" strokeWidth="1.2"/>
                    <rect x="25" y="9" width="10" height="8" fill="#dbeafe" stroke="#1a1d1f" strokeWidth="1.2"/>
                    <rect x="16" y="26" width="12" height="14" fill="#e8d5b7" stroke="#1a1d1f" strokeWidth="1.2"/>
                    <line x1="4" y1="22" x2="40" y2="22" stroke="#1a1d1f" strokeWidth="1.2"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: serif, fontSize: 19, fontWeight: 500, color: T.ink }}>Gevel</div>
                  <div style={{ fontSize: 13, color: T.inkSoft, fontFamily: font }}>Ramen, voordeur, kleur en meer</div>
                </div>
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${scopes.gevel ? T.accent : T.lineStrong}`,
                background: scopes.gevel ? T.accent : T.surface,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 13, fontWeight: 700,
              }}>
                {scopes.gevel ? '✓' : '+'}
              </div>
            </button>
            {scopes.gevel && (
              <div style={{ padding: '20px 24px 24px', borderTop: `1px solid ${T.line}` }}>
                {optGroup('Ramen',
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    <PicTile svg={<WindowSvg type="neutral"/>} label="Huidig" selected={config.gevel.ramen === 'Huidig behouden'} onClick={() => onGevelChange('ramen', 'Huidig behouden')}/>
                    <PicTile svg={<WindowSvg type="hout"/>} label="Hout" selected={config.gevel.ramen === 'Houten ramen'} onClick={() => onGevelChange('ramen', 'Houten ramen')}/>
                    <PicTile svg={<WindowSvg type="pvc-wit"/>} label="PVC wit" selected={config.gevel.ramen === 'PVC ramen wit'} onClick={() => onGevelChange('ramen', 'PVC ramen wit')}/>
                    <PicTile svg={<WindowSvg type="pvc-zwart"/>} label="PVC zwart" selected={config.gevel.ramen === 'PVC ramen zwart'} onClick={() => onGevelChange('ramen', 'PVC ramen zwart')}/>
                    <PicTile svg={<WindowSvg type="alu"/>} label="Aluminium" selected={config.gevel.ramen === 'Aluminium ramen'} onClick={() => onGevelChange('ramen', 'Aluminium ramen')}/>
                    <PicTile svg={<WindowSvg type="staal"/>} label="Staal" selected={config.gevel.ramen === 'Stalen ramen'} onClick={() => onGevelChange('ramen', 'Stalen ramen')}/>
                    <PicTile svg={<WindowSvg type="panorama"/>} label="Panorama" selected={config.gevel.ramen === 'Panoramaramen'} onClick={() => onGevelChange('ramen', 'Panoramaramen')}/>
                  </div>
                )}
                {optGroup('Voordeur',
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    <PicTile svg={<DoorSvg type="neutral"/>} label="Huidig" selected={config.gevel.deur === 'Huidig behouden'} onClick={() => onGevelChange('deur', 'Huidig behouden')}/>
                    <PicTile svg={<DoorSvg type="klassiek"/>} label="Klassiek" selected={config.gevel.deur === 'Voordeur klassiek'} onClick={() => onGevelChange('deur', 'Voordeur klassiek')}/>
                    <PicTile svg={<DoorSvg type="modern"/>} label="Modern" selected={config.gevel.deur === 'Voordeur modern'} onClick={() => onGevelChange('deur', 'Voordeur modern')}/>
                    <PicTile svg={<DoorSvg type="staal"/>} label="Staal" selected={config.gevel.deur === 'Voordeur staal'} onClick={() => onGevelChange('deur', 'Voordeur staal')}/>
                    <PicTile svg={<DoorSvg type="hout"/>} label="Hout" selected={config.gevel.deur === 'Voordeur hout'} onClick={() => onGevelChange('deur', 'Voordeur hout')}/>
                    <PicTile svg={<DoorSvg type="draai"/>} label="Draai" selected={config.gevel.deur === 'Draaideuren'} onClick={() => onGevelChange('deur', 'Draaideuren')}/>
                    <PicTile svg={<DoorSvg type="schuif"/>} label="Schuif" selected={config.gevel.deur === 'Schuifdeuren'} onClick={() => onGevelChange('deur', 'Schuifdeuren')}/>
                  </div>
                )}
                {optGroup('Kleur gevel',
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                    {GEVEL_KLEUREN.map(c => (
                      <ColorSwatch key={c.name} name={c.name} hex={c.hex} selected={config.gevel.kleur === c.name} onClick={() => onGevelChange('kleur', c.name)}/>
                    ))}
                  </div>
                )}
                {optGroup('Kleur voordeur',
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                    {GEVEL_DEURKLEUREN.map(c => (
                      <ColorSwatch key={c.name} name={c.name} hex={c.hex} selected={config.gevel.deurkleur === c.name} onClick={() => onGevelChange('deurkleur', c.name)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.line}` }}>
        <button onClick={onBack} style={{ padding: '14px 28px', borderRadius: 100, fontSize: 15, fontWeight: 600, background: 'transparent', color: T.inkSoft, border: 'none', cursor: 'pointer', fontFamily: font }}>
          ← Terug
        </button>
        <button
          onClick={anySelected ? onNext : undefined}
          disabled={!anySelected}
          style={{
            padding: '14px 28px', borderRadius: 100, fontSize: 15, fontWeight: 600,
            background: anySelected ? T.ink : T.lineStrong,
            color: anySelected ? T.bg : T.inkMuted,
            border: 'none', cursor: anySelected ? 'pointer' : 'not-allowed',
            fontFamily: font, transition: 'all 0.2s ease',
          }}
        >
          Meer details →
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   STEP 3 SVG ICON LIBRARY
   ================================================================ */

/* — Roof shape types — */
function RoofTypeSvg({ type }: { type: string }) {
  const body = <rect x="4" y="32" width="36" height="10" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="1.5"/>;
  if (type === 'zadel') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48">{body}<path d="M4 32L22 10L40 32Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
  if (type === 'plat') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="18" width="36" height="6" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.8"/><rect x="6" y="24" width="32" height="16" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="1.5"/></svg>;
  if (type === 'schild') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48">{body}<path d="M12 18L32 18L40 32L4 32Z" fill="#d4d0c8" stroke="#1a1d1f" strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 18L22 10L32 18" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
  if (type === 'mansarde') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48">{body}<path d="M4 32L10 20L34 20L40 32Z" fill="#c8c4bc" stroke="#1a1d1f" strokeWidth="1.8" strokeLinejoin="round"/><rect x="10" y="12" width="24" height="8" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.5"/></svg>;
  if (type === 'tent') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><path d="M22 6L40 28L22 40L4 28Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.8" strokeLinejoin="round"/><line x1="22" y1="6" x2="22" y2="40" stroke="#1a1d1f" strokeWidth="1"/><line x1="4" y1="28" x2="40" y2="28" stroke="#1a1d1f" strokeWidth="1"/></svg>;
  if (type === 'lessenaars') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48">{body}<path d="M4 32L40 14L40 32Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
  return <svg viewBox="0 0 44 44" fill="none" width="48" height="48">{body}<path d="M4 14L22 32L40 14" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
}

/* — Roof material texture swatches — */
function RoofMaterialSvg({ type }: { type: string }) {
  if (type === 'dakpannen') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#c4835a" stroke="#1a1d1f" strokeWidth="1.5"/>{[0,1,2,3].map(row=>[0,1,2,3,4].map(col=><path key={`${row}-${col}`} d={`M${4+col*8+(row%2===0?0:4)} ${9+row*8} Q${8+col*8+(row%2===0?0:4)} ${5+row*8} ${12+col*8+(row%2===0?0:4)} ${9+row*8}`} stroke="#8b5530" strokeWidth="1.2"/>))}</svg>;
  if (type === 'leien') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#4a5568" stroke="#1a1d1f" strokeWidth="1.5"/>{[0,1,2,3,4].map(row=>[0,1,2,3].map(col=><rect key={`${row}-${col}`} x={4+col*9+(row%2===0?0:4.5)} y={4+row*7} width="8" height="6" rx="0.5" fill="#5a6680" stroke="#2d3748" strokeWidth="0.8"/>))}</svg>;
  if (type === 'epdm') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#1f2937" stroke="#1a1d1f" strokeWidth="1.5"/><rect x="10" y="19" width="24" height="5" rx="2" fill="#374151"/></svg>;
  if (type === 'roofing') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#374151" stroke="#1a1d1f" strokeWidth="1.5"/>{[0,1,2,3,4,5].map(i=><line key={i} x1="6" y1={10+i*5} x2="38" y2={10+i*5} stroke="#4b5563" strokeWidth="1.5"/>)}</svg>;
  if (type === 'metaal') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#9ca3af" stroke="#1a1d1f" strokeWidth="1.5"/>{[0,1,2,3,4].map(i=><line key={i} x1={9+i*7} y1="6" x2={9+i*7} y2="38" stroke="#6b7280" strokeWidth="2.5"/>)}</svg>;
  if (type === 'groen') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#5a7a50" stroke="#1a1d1f" strokeWidth="1.5"/>{[[8,30],[15,26],[22,32],[29,27],[36,30],[10,38],[22,38],[34,38]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="5" fill="#3d5c35" opacity="0.85"/>)}</svg>;
  if (type === 'zink') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#8fa0b4" stroke="#1a1d1f" strokeWidth="1.5"/>{[0,1,2,3,4,5].map(i=><line key={i} x1={4+i*6} y1="4" x2={4+i*6+30} y2="40" stroke="#7a8fa3" strokeWidth="1" opacity="0.7"/>)}</svg>;
  if (type === 'keramisch') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#c4733a" stroke="#1a1d1f" strokeWidth="1.5"/>{[0,1,2,3,4].map(row=>[0,1,2,3].map(col=><rect key={`${row}-${col}`} x={4+col*9} y={4+row*7} width="9" height="7" fill="none" stroke="#a05828" strokeWidth="0.8"/>))}</svg>;
  return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#9ca3af" stroke="#1a1d1f" strokeWidth="1.5"/>{[0,1,2,3,4].map(row=>[0,1].map(col=><rect key={`${row}-${col}`} x={4+col*18} y={4+row*7} width="18" height="7" fill="none" stroke="#6b7280" strokeWidth="0.8"/>))}</svg>;
}

/* — Gutter cross-section — */
function GutterSvg({ material }: { material: string }) {
  const c: Record<string, { fill: string; stroke: string }> = {
    'Zink': { fill: '#8fa0b4', stroke: '#6b7280' },
    'Aluminium': { fill: '#d1d5db', stroke: '#9ca3af' },
    'PVC': { fill: '#fef9c3', stroke: '#ca8a04' },
    'Koper': { fill: '#b45309', stroke: '#92400e' },
    'Staal': { fill: '#6b7280', stroke: '#374151' },
  };
  const { fill, stroke } = c[material] ?? c['Staal'];
  return (
    <svg viewBox="0 0 44 44" fill="none" width="48" height="48">
      <line x1="4" y1="16" x2="40" y2="16" stroke="#1a1d1f" strokeWidth="2"/>
      <path d="M6 16 L6 26 Q6 30 10 30 L34 30 Q38 30 38 26 L38 16" fill={fill} stroke={stroke} strokeWidth="1.8"/>
      <rect x="30" y="30" width="5" height="12" rx="1" fill={fill} stroke={stroke} strokeWidth="1.5"/>
    </svg>
  );
}

/* — Facade finish texture swatches — */
function FacadeFinishSvg({ type }: { type: string }) {
  if (type === 'crepi') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#e8dcc8" stroke="#1a1d1f" strokeWidth="1.5"/>{[[8,10],[14,8],[10,16],[20,12],[26,8],[22,18],[30,14],[34,10],[16,24],[28,22],[12,30],[24,28],[36,26],[10,36],[22,34],[32,32]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="1.5" fill="#c8b89a"/>)}</svg>;
  if (type === 'gevelpleister') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="1.5"/><rect x="6" y="6" width="8" height="32" rx="1" fill="white" opacity="0.35"/></svg>;
  if (type === 'hout') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#c4935a" stroke="#1a1d1f" strokeWidth="1.5"/>{[0,1,2,3,4,5,6].map(i=><line key={i} x1="6" y1={9+i*5} x2="38" y2={9+i*5} stroke="#8b5e3c" strokeWidth="1.5"/>)}</svg>;
  if (type === 'steenstrips') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#c4835a" stroke="#1a1d1f" strokeWidth="1.5"/>{[0,1,2,3,4,5].map(row=>[0,1,2].map(col=><rect key={`${row}-${col}`} x={4+col*12+(row%2===0?0:6)} y={5+row*6} width="11" height="5" rx="0.5" fill="#b07040" stroke="#8b4820" strokeWidth="0.8"/>))}</svg>;
  if (type === 'gevelpanelen') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#e0ddd8" stroke="#1a1d1f" strokeWidth="1.5"/><line x1="22" y1="4" x2="22" y2="40" stroke="#aaa8a4" strokeWidth="1.5"/><line x1="4" y1="22" x2="40" y2="22" stroke="#aaa8a4" strokeWidth="1.5"/></svg>;
  if (type === 'schilderwerk') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#f5f3ee" stroke="#1a1d1f" strokeWidth="1.5"/><rect x="12" y="14" width="20" height="10" rx="5" fill="#c8553d" stroke="#1a1d1f" strokeWidth="1.5"/><line x1="22" y1="24" x2="22" y2="34" stroke="#1a1d1f" strokeWidth="2"/><line x1="16" y1="34" x2="28" y2="34" stroke="#1a1d1f" strokeWidth="2" strokeLinecap="round"/></svg>;
  if (type === 'baksteen') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#c4733a" stroke="#1a1d1f" strokeWidth="1.5"/>{[0,1,2,3,4,5].map(row=>[0,1].map(col=><rect key={`${row}-${col}`} x={4+col*18+(row%2===0?0:9)} y={5+row*6} width="17" height="5" rx="0.5" fill="#b35c28" stroke="#8b4420" strokeWidth="0.8"/>))}</svg>;
  if (type === 'natuursteen') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#9ca3af" stroke="#1a1d1f" strokeWidth="1.5"/><path d="M6 8L16 6L20 14L12 18L6 16Z" fill="#8fa0b4" stroke="#6b7280" strokeWidth="0.8"/><path d="M18 7L32 6L36 12L28 18L18 14Z" fill="#7a8fa3" stroke="#6b7280" strokeWidth="0.8"/><path d="M6 20L18 18L22 28L10 30L6 26Z" fill="#8fa0b4" stroke="#6b7280" strokeWidth="0.8"/><path d="M22 20L36 18L38 28L24 32Z" fill="#7a8fa3" stroke="#6b7280" strokeWidth="0.8"/><path d="M8 32L20 30L22 38L10 38Z" fill="#8fa0b4" stroke="#6b7280" strokeWidth="0.8"/><path d="M24 32L36 30L38 38L26 38Z" fill="#7a8fa3" stroke="#6b7280" strokeWidth="0.8"/></svg>;
  if (type === 'composiet') return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#6b7280" stroke="#1a1d1f" strokeWidth="1.5"/>{[0,1,2,3,4,5].map(i=><rect key={i} x="6" y={6+i*5} width="32" height="4" rx="0.5" fill="#7a8fa3" stroke="#4b5563" strokeWidth="0.6"/>)}</svg>;
  return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" rx="2" fill="#d1d5db" stroke="#1a1d1f" strokeWidth="1.5"/>{[0,1,2].map(row=>[0,1,2].map(col=><rect key={`${row}-${col}`} x={4+col*12} y={4+row*12} width="12" height="12" fill="none" stroke="#9ca3af" strokeWidth="0.8"/>))}</svg>;
}

/* — Which facades — */
function FacadeViewSvg({ view }: { view: string }) {
  const hi = '#c8553d';
  const front = view==='voor'||view==='alle';
  const right = view==='rechts'||view==='alle';
  const left  = view==='links'||view==='alle';
  return (
    <svg viewBox="0 0 44 44" fill="none" width="48" height="48">
      <path d="M6 20L22 8L38 20Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="6" y="20" width="26" height="20" fill={front ? '#fde8e4' : '#f0ede8'} stroke={front ? hi : '#1a1d1f'} strokeWidth={front ? 2 : 1.5}/>
      <path d="M32 20L40 25L40 40L32 40Z" fill={right ? '#fde8e4' : '#e0ddd8'} stroke={right ? hi : '#1a1d1f'} strokeWidth={right ? 2 : 1.5} strokeLinejoin="round"/>
      {left && <path d="M6 20L0 25L0 40L6 40Z" fill="#fde8e4" stroke={hi} strokeWidth="2" strokeLinejoin="round"/>}
      {front && <rect x="14" y="29" width="8" height="11" fill={hi} stroke="#1a1d1f" strokeWidth="1"/>}
      {view==='achter' && <path d="M16 24L22 20L28 24" stroke={hi} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>}
    </svg>
  );
}

/* — Dak extras — */
function DakExtraSvg({ type }: { type: string }) {
  if (type.includes('Dakgoten')) return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><line x1="4" y1="16" x2="40" y2="16" stroke="#1a1d1f" strokeWidth="2"/><path d="M6 16 L6 26 Q6 30 10 30 L34 30 Q38 30 38 26 L38 16" fill="#9ca3af" stroke="#6b7280" strokeWidth="1.8"/><rect x="30" y="30" width="4" height="12" rx="1" fill="#9ca3af" stroke="#6b7280" strokeWidth="1.2"/></svg>;
  if (type.includes('Isolatie')) return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><path d="M4 30L22 10L40 30" stroke="#1a1d1f" strokeWidth="1.5" fill="none"/>{[0,1,2,3].map(i=><path key={i} d={`M${6+i*9} ${28-i*4} Q${10.5+i*9} ${22-i*4} ${15+i*9} ${28-i*4}`} fill="#fef3c7" stroke="#ca8a04" strokeWidth="1.2"/>)}</svg>;
  if (type.includes('Dakkapel')) return <RoofSvg dormer="small"/>;
  if (type.includes('Dakraam')) return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><path d="M4 36L22 12L40 36Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.8" strokeLinejoin="round"/><rect x="16" y="21" width="12" height="9" rx="1" fill="#dbeafe" stroke="#374151" strokeWidth="1.5"/></svg>;
  if (type.includes('Schoorsteen')) return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><path d="M4 34L22 12L40 34Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.5" strokeLinejoin="round"/><rect x="16" y="8" width="8" height="14" fill="#c4835a" stroke="#8b5530" strokeWidth="1.5"/><rect x="14" y="6" width="12" height="4" rx="1" fill="#b87040" stroke="#8b5530" strokeWidth="1.2"/></svg>;
  if (type.includes('Regenwaterput')) return <svg viewBox="0 0 44 44" fill="none" width="48" height="48">{[[13,8],[21,4],[29,8],[17,15],[25,14]].map(([cx,cy],i)=><path key={i} d={`M${cx} ${cy+5}Q${cx-2} ${cy+2} ${cx} ${cy}Q${cx+2} ${cy+2} ${cx} ${cy+5}Z`} fill="#3b82f6"/>)}<ellipse cx="22" cy="34" rx="14" ry="7" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/><rect x="8" y="28" width="28" height="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/><ellipse cx="22" cy="28" rx="14" ry="4" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1.5"/></svg>;
  if (type.includes('Zonneboiler')) return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="6" width="22" height="16" rx="1" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/><line x1="15" y1="6" x2="15" y2="22" stroke="#3b82f6" strokeWidth="0.8"/><line x1="4" y1="14" x2="26" y2="14" stroke="#3b82f6" strokeWidth="0.8"/><ellipse cx="35" cy="30" rx="7" ry="10" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="1.5"/><path d="M26 16Q30 16 30 24" stroke="#9ca3af" strokeWidth="1.5" fill="none"/></svg>;
  return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><path d="M4 34L22 12L40 34Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.5" strokeLinejoin="round"/><rect x="18" y="23" width="8" height="6" rx="1" fill="#9ca3af" stroke="#6b7280" strokeWidth="1.2"/><path d="M18 23L16 19L28 19L26 23" fill="#b0ada8" stroke="#6b7280" strokeWidth="1"/><path d="M30 18L34 14M32 14L34 14L34 16" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round"/></svg>;
}

/* — Gevel extras — */
function GevelExtraSvg({ type }: { type: string }) {
  if (type.includes('Gevelisolatie')) return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="12" height="36" fill="#e8dcc8" stroke="#1a1d1f" strokeWidth="1.5"/><rect x="16" y="4" width="10" height="36" fill="#fef3c7" stroke="#ca8a04" strokeWidth="1.5"/>{[0,1,2,3,4].map(i=><path key={i} d={`M16 ${9+i*7}Q20 ${7+i*7} 24 ${9+i*7}Q28 ${11+i*7} 26 ${9+i*7}`} stroke="#ca8a04" strokeWidth="0.8" fill="none"/>)}<rect x="26" y="4" width="14" height="36" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="1.5"/></svg>;
  if (type.includes('Raamomlijsting')) return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="1.5"/><rect x="10" y="10" width="24" height="20" fill="#dbeafe" stroke="#1a1d1f" strokeWidth="1.2"/><rect x="8" y="8" width="28" height="24" fill="none" stroke="#c8b89a" strokeWidth="4"/></svg>;
  if (type.includes('Plint')) return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="28" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="1.5"/><rect x="4" y="32" width="36" height="8" fill="#c8b89a" stroke="#1a1d1f" strokeWidth="1.5"/></svg>;
  if (type.includes('Regenpijpen')) return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="1.5"/><rect x="32" y="4" width="6" height="32" rx="2" fill="#9ca3af" stroke="#6b7280" strokeWidth="1.2"/><path d="M32 36Q32 42 26 42" stroke="#9ca3af" strokeWidth="2" fill="none"/></svg>;
  if (type.includes('Luiken')) return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="1.5"/><rect x="14" y="10" width="16" height="22" fill="#dbeafe" stroke="#1a1d1f" strokeWidth="1.2"/><rect x="6" y="10" width="7" height="22" fill="#c4935a" stroke="#8b5e3c" strokeWidth="1.2"/>{[0,1,2,3,4].map(i=><line key={i} x1="6" y1={13+i*4} x2="13" y2={13+i*4} stroke="#8b5e3c" strokeWidth="0.8"/>)}<rect x="31" y="10" width="7" height="22" fill="#c4935a" stroke="#8b5e3c" strokeWidth="1.2"/>{[0,1,2,3,4].map(i=><line key={i} x1="31" y1={13+i*4} x2="38" y2={13+i*4} stroke="#8b5e3c" strokeWidth="0.8"/>)}</svg>;
  if (type.includes('Rolluiken')) return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="4" width="36" height="36" fill="#f0ede8" stroke="#1a1d1f" strokeWidth="1.5"/><rect x="10" y="10" width="24" height="22" fill="#dbeafe" stroke="#1a1d1f" strokeWidth="1.2"/><rect x="10" y="10" width="24" height="12" fill="#9ca3af" stroke="#6b7280" strokeWidth="1.2"/>{[0,1,2,3].map(i=><line key={i} x1="10" y1={13+i*3} x2="34" y2={13+i*3} stroke="#6b7280" strokeWidth="0.8"/>)}</svg>;
  if (type.includes('Terrasoverkapping')) return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="6" y="22" width="3" height="18" fill="#c4935a" stroke="#8b5e3c" strokeWidth="1"/><rect x="35" y="22" width="3" height="18" fill="#c4935a" stroke="#8b5e3c" strokeWidth="1"/><path d="M2 16L42 22L42 24L2 18Z" fill="#e8e4dc" stroke="#1a1d1f" strokeWidth="1.5"/>{[0,1,2,3].map(i=><line key={i} x1="6" y1={18+i*1.5} x2="38" y2={19.5+i*1.5} stroke="#d4cebf" strokeWidth="0.8"/>)}<rect x="4" y="38" width="36" height="4" fill="#d4cebf" stroke="#1a1d1f" strokeWidth="1"/></svg>;
  return <svg viewBox="0 0 44 44" fill="none" width="48" height="48"><rect x="4" y="14" width="3" height="22" fill="#9ca3af" stroke="#6b7280" strokeWidth="1"/><rect x="37" y="14" width="3" height="22" fill="#9ca3af" stroke="#6b7280" strokeWidth="1"/><rect x="2" y="10" width="40" height="5" fill="#6b7280" stroke="#374151" strokeWidth="1.5"/><rect x="8" y="28" width="28" height="8" rx="2" fill="#4b5563" stroke="#374151" strokeWidth="1.2"/><path d="M12 28L14 22L30 22L32 28" fill="#374151" stroke="#374151" strokeWidth="1"/><circle cx="14" cy="37" r="3" fill="#1f2937" stroke="#374151" strokeWidth="1"/><circle cx="30" cy="37" r="3" fill="#1f2937" stroke="#374151" strokeWidth="1"/></svg>;
}

/* ================================================================
   STEP 3 — CONFIGURATION
   ================================================================ */
function QuickOptionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: 16, marginTop: 16, borderTop: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: font }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Step3Config({
  photoUrl, scopes, config, onDakChange, onGevelChange, onBack, onGenerate,
}: {
  photoUrl: string;
  scopes: Scopes;
  config: Config;
  onDakChange: <K extends keyof Config['dak']>(field: K, value: Config['dak'][K]) => void;
  onGevelChange: <K extends keyof Config['gevel']>(field: K, value: Config['gevel'][K]) => void;
  onBack: () => void;
  onGenerate: () => void;
}) {
  const title = scopes.dak && scopes.gevel ? 'Configureer dak en gevel'
    : scopes.dak ? 'Configureer het dak' : 'Configureer de gevel';

  const toggleArr = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  // Count selected options for the badge
  const selectedCount = [
    config.dak.type, config.dak.bedekking, config.dak.kleur,
    config.dak.zonnepanelen, config.dak.dakkapel, config.dak.dakgoot,
    config.gevel.afwerking, config.gevel.kleur, config.gevel.ramen,
    config.gevel.deur, config.gevel.deurkleur,
  ].filter(Boolean).length + config.dak.extras.length + config.gevel.extras.length + config.gevel.gevels.length;

  return (
    <div>
      <StepHeader
        eyebrow="Stap 3 van 3"
        title={title}
        subtitle="Stel de gewenste materialen, kleuren en details in. Je kan later altijd aanpassen."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,380px) minmax(0,1fr)', gap: 28, alignItems: 'start' }}>

        {/* LEFT — sticky photo + visual quick options */}
        <div style={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Photo card */}
          <div style={{ background: T.surface, borderRadius: 20, padding: 16, boxShadow: '0 4px 12px rgba(20,20,20,0.06)', border: `1px solid ${T.line}` }}>
            <img src={photoUrl} alt="Origineel" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 10, display: 'block' }} />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.accentDeep, background: T.accentSoft, padding: '4px 10px', borderRadius: 100, fontWeight: 700, fontFamily: font }}>Origineel</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {scopes.dak && <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: T.accentSoft, color: T.accentDeep, fontFamily: font }}>Dak</span>}
                {scopes.gevel && <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: T.accentSoft, color: T.accentDeep, fontFamily: font }}>Gevel</span>}
              </div>
            </div>
          </div>

          {/* Summary card — what was set in step 2 */}
          <div style={{ background: T.surface, borderRadius: 20, padding: 20, border: `1px solid ${T.line}` }}>
            <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 500, color: T.ink, display: 'block', marginBottom: 12 }}>Al ingesteld</span>
            {[
              config.dak.zonnepanelen && config.dak.zonnepanelen !== 'Geen' && { label: '☀️ Zonnepanelen', value: config.dak.zonnepanelen },
              config.dak.dakkapel && config.dak.dakkapel !== 'Geen dakkapel' && { label: '🏠 Dakkapel', value: config.dak.dakkapel },
              config.gevel.ramen && config.gevel.ramen !== 'Huidig behouden' && { label: '🪟 Ramen', value: config.gevel.ramen },
              config.gevel.deur && config.gevel.deur !== 'Huidig behouden' && { label: '🚪 Voordeur', value: config.gevel.deur },
              config.gevel.deurkleur && { label: '🎨 Deurkleur', value: config.gevel.deurkleur },
            ].filter(Boolean).map((item, i) => item && (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: `1px solid ${T.line}`, fontFamily: font }}>
                <span style={{ color: T.inkMuted }}>{item.label}</span>
                <span style={{ color: T.ink, fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
            {!config.dak.zonnepanelen && !config.gevel.ramen && !config.gevel.deur && (
              <p style={{ fontSize: 13, color: T.inkMuted, fontFamily: font }}>Ingesteld in stap 2</p>
            )}
          </div>
        </div>

        {/* RIGHT — detailed config panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {scopes.dak && (
            <ConfigSection
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M3 12L12 4l9 8v8H3v-8z" /></svg>}
              title="Dak — materiaal & kleur"
            >
              <ConfigGroup label="Type dak">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[['Zadeldak','zadel'],['Plat dak','plat'],['Schilddak','schild'],['Mansardedak','mansarde'],['Tentdak','tent'],['Lessenaarsdak','lessenaars'],['Vlinderdak','vlinder']].map(([label, type]) => (
                    <PicTile key={label} svg={<RoofTypeSvg type={type}/>} label={label} selected={config.dak.type === label} onClick={() => onDakChange('type', label)}/>
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Dakbedekking">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {[['Dakpannen','dakpannen'],['Leien','leien'],['EPDM','epdm'],['Roofing/bitumen','roofing'],['Metalen dakpanelen','metaal'],['Groendak','groen'],['Zink','zink'],['Keramische pannen','keramisch'],['Betonpannen','beton']].map(([label, type]) => (
                    <PicTile key={label} svg={<RoofMaterialSvg type={type}/>} label={label} selected={config.dak.bedekking === label} onClick={() => onDakChange('bedekking', label)}/>
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Kleur dak">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {DAK_KLEUREN.map(c => (
                    <ColorSwatch key={c.name} name={c.name} hex={c.hex} selected={config.dak.kleur === c.name} onClick={() => onDakChange('kleur', c.name)} />
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Dakgoot">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {DAK_GOOT.map(opt => (
                    <PicTile key={opt} svg={<GutterSvg material={opt}/>} label={opt} selected={config.dak.dakgoot === opt} onClick={() => onDakChange('dakgoot', opt)}/>
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Extra opties">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {DAK_EXTRAS.map(opt => (
                    <PicTile key={opt} svg={<DakExtraSvg type={opt}/>} label={opt} selected={config.dak.extras.includes(opt)} onClick={() => onDakChange('extras', toggleArr(config.dak.extras, opt))}/>
                  ))}
                </div>
              </ConfigGroup>
            </ConfigSection>
          )}

          {scopes.gevel && (
            <ConfigSection
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><rect x="4" y="4" width="16" height="16" /><path d="M9 10v4M15 10v4" /></svg>}
              title="Gevel — materiaal & kleur"
            >
              <ConfigGroup label="Type gevelafwerking">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {[['Crepi','crepi'],['Gevelpleister','gevelpleister'],['Houten gevelbekleding','hout'],['Steenstrips','steenstrips'],['Gevelpanelen','gevelpanelen'],['Schilderwerk','schilderwerk'],['Baksteen','baksteen'],['Natuursteen','natuursteen'],['Composiet','composiet'],['Betonlook','beton']].map(([label, type]) => (
                    <PicTile key={label} svg={<FacadeFinishSvg type={type}/>} label={label} selected={config.gevel.afwerking === label} onClick={() => onGevelChange('afwerking', label)}/>
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Welke gevels?">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {[['Voorgevel','voor'],['Achtergevel','achter'],['Linkergevel','links'],['Rechtergevel','rechts'],['Alle gevels','alle']].map(([label, view]) => (
                    <PicTile key={label} svg={<FacadeViewSvg view={view}/>} label={label} selected={config.gevel.gevels.includes(label)} onClick={() => onGevelChange('gevels', toggleArr(config.gevel.gevels, label))}/>
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Kleur gevel">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                  {GEVEL_KLEUREN.map(c => (
                    <ColorSwatch key={c.name} name={c.name} hex={c.hex} selected={config.gevel.kleur === c.name} onClick={() => onGevelChange('kleur', c.name)} />
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Extra opties">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {GEVEL_EXTRAS.map(opt => (
                    <PicTile key={opt} svg={<GevelExtraSvg type={opt}/>} label={opt} selected={config.gevel.extras.includes(opt)} onClick={() => onGevelChange('extras', toggleArr(config.gevel.extras, opt))}/>
                  ))}
                </div>
              </ConfigGroup>
            </ConfigSection>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.line}` }}>
        <button onClick={onBack} style={{ padding: '14px 28px', borderRadius: 100, fontSize: 15, fontWeight: 600, background: 'transparent', color: T.inkSoft, border: 'none', cursor: 'pointer', fontFamily: font }}>
          ← Terug
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {selectedCount > 0 && (
            <span style={{ fontSize: 13, color: T.inkSoft, fontFamily: font }}>{selectedCount} optie{selectedCount !== 1 ? 's' : ''} geselecteerd</span>
          )}
          <button onClick={onGenerate} style={{ padding: '14px 32px', borderRadius: 100, fontSize: 15, fontWeight: 600, background: T.accent, color: 'white', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: font, transition: 'all 0.2s ease' }}>
            ✨ Genereer visualisatie
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   LOADING STEP
   ================================================================ */
function StepLoading({ photoUrl, progress }: { photoUrl: string; progress: number }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ width: '100%', maxWidth: 320, aspectRatio: '4/3', margin: '0 auto 32px', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 48px -12px rgba(20,20,20,0.12)', position: 'relative' }}>
        <img src={photoUrl} alt="Verwerking" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(2px) brightness(0.85)', transform: 'scale(1.05)' }} />
        <div className="shimmer-overlay" />
      </div>

      <div className="spinner-wrap">
        <div className="spinner-track" />
        <div className="spinner-fill" />
      </div>

      <h2 style={{ fontFamily: serif, fontSize: 28, marginBottom: 8, color: T.ink }}>Je visualisatie wordt voorbereid…</h2>
      <p style={{ color: T.inkSoft, fontSize: 15, marginBottom: 32, fontFamily: font }}>We passen de gekozen dak- en gevelopties toe op de foto.</p>

      <div style={{ width: '100%', height: 4, background: T.line, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: T.accent, width: `${progress}%`, transition: 'width 0.3s ease', borderRadius: 2 }} />
      </div>
    </div>
  );
}

/* ================================================================
   RESULT STEP
   ================================================================ */
function SummaryChip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: 100, padding: '6px 12px',
    }}>
      <span style={{ fontSize: 11, color: T.inkMuted, fontFamily: font, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      {color && <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0 }} />}
      <span style={{ fontSize: 13, color: T.ink, fontFamily: font, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function StepResult({ photoUrl, resultUrl, scopes, config, onRestart, onAdjust }: {
  photoUrl: string;
  resultUrl: string;
  scopes: Scopes;
  config: Config;
  onRestart: () => void;
  onAdjust: () => void;
}) {
  // Gather all chips for the summary
  const allChips: { label: string; value: string; color?: string }[] = [];

  if (scopes.dak) {
    if (config.dak.type) allChips.push({ label: 'Daktype', value: config.dak.type });
    if (config.dak.bedekking) allChips.push({ label: 'Bedekking', value: config.dak.bedekking });
    if (config.dak.kleur) {
      const hexMatch = DAK_KLEUREN.find(c => c.name === config.dak.kleur);
      allChips.push({ label: 'Dakkleur', value: config.dak.kleur, color: hexMatch?.hex });
    }
    if (config.dak.zonnepanelen && config.dak.zonnepanelen !== 'Geen') allChips.push({ label: 'Zonnepanelen', value: config.dak.zonnepanelen });
    if (config.dak.dakkapel && config.dak.dakkapel !== 'Geen dakkapel') allChips.push({ label: 'Dakkapel', value: config.dak.dakkapel });
    if (config.dak.dakgoot) allChips.push({ label: 'Dakgoot', value: config.dak.dakgoot });
    config.dak.extras.forEach(e => allChips.push({ label: 'Extra', value: e }));
  }
  if (scopes.gevel) {
    if (config.gevel.afwerking) allChips.push({ label: 'Gevel', value: config.gevel.afwerking });
    if (config.gevel.gevels.length > 0) allChips.push({ label: 'Gevels', value: config.gevel.gevels.join(', ') });
    if (config.gevel.kleur) {
      const hexMatch = GEVEL_KLEUREN.find(c => c.name === config.gevel.kleur);
      allChips.push({ label: 'Gevelkleur', value: config.gevel.kleur, color: hexMatch?.hex });
    }
    if (config.gevel.ramen && config.gevel.ramen !== 'Huidig behouden') allChips.push({ label: 'Ramen', value: config.gevel.ramen });
    if (config.gevel.deur && config.gevel.deur !== 'Huidig behouden') allChips.push({ label: 'Voordeur', value: config.gevel.deur });
    if (config.gevel.deurkleur) {
      const hexMatch = GEVEL_DEURKLEUREN.find(c => c.name === config.gevel.deurkleur);
      allChips.push({ label: 'Deurkleur', value: config.gevel.deurkleur, color: hexMatch?.hex });
    }
    config.gevel.extras.forEach(e => allChips.push({ label: 'Extra', value: e }));
  }

  return (
    <div>
      <StepHeader eyebrow="✓ Klaar" title="Je visualisatie is klaar" subtitle="Vergelijk het resultaat met de originele foto en bekijk de gekozen configuratie." green />

      {/* Photos side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16, alignItems: 'start', marginBottom: 20 }}>
        {/* Result — large */}
        <div style={{ background: T.surface, borderRadius: 20, padding: 16, boxShadow: '0 4px 16px rgba(20,20,20,0.08)', border: `1px solid ${T.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.inkMuted, fontWeight: 600, fontFamily: font }}>Na renovatie</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#1a4a2e', color: '#d1f5e0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, padding: '4px 10px', borderRadius: 100, fontFamily: font }}>
              <span style={{ width: 5, height: 5, background: '#34d399', borderRadius: '50%' }} />
              Visualisatie
            </div>
          </div>
          <img src={resultUrl} alt="Resultaat" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 10, display: 'block' }} />
        </div>

        {/* Original — smaller */}
        <div style={{ background: T.surface, borderRadius: 20, padding: 16, border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.inkMuted, fontWeight: 600, marginBottom: 10, fontFamily: font }}>Origineel</div>
          <img src={photoUrl} alt="Origineel" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 10, display: 'block' }} />
        </div>
      </div>

      {/* Summary chips below photos */}
      {allChips.length > 0 && (
        <div style={{ background: T.surface, borderRadius: 20, padding: 20, border: `1px solid ${T.line}`, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 500, color: T.ink }}>Configuratiesamenvatting</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: T.accentSoft, color: T.accentDeep, borderRadius: 100, padding: '2px 9px', fontFamily: font }}>{allChips.length} opties</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {allChips.map((chip, i) => (
              <SummaryChip key={i} label={chip.label} value={chip.value} color={chip.color} />
            ))}
          </div>
        </div>
      )}

      {/* Action buttons row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={onRestart} style={{
          padding: '14px 28px', borderRadius: 100, fontSize: 15, fontWeight: 600,
          background: T.ink, color: T.bg, border: 'none', cursor: 'pointer', fontFamily: font,
          transition: 'all 0.2s ease',
        }}>
          Nieuwe foto uploaden
        </button>
        <button onClick={onAdjust} style={{
          padding: '14px 28px', borderRadius: 100, fontSize: 15, fontWeight: 600,
          background: T.surface, color: T.ink, border: `1px solid ${T.lineStrong}`,
          cursor: 'pointer', fontFamily: font, transition: 'all 0.2s ease',
        }}>
          ✏️ Aanpassen
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   STEPPER
   ================================================================ */
function Stepper({ activePill }: { activePill: number }) {
  const steps = [
    { num: 1, label: 'Upload' },
    { num: 2, label: 'Onderdelen' },
    { num: 3, label: 'Configuratie' },
    { num: 4, label: 'Resultaat' },
  ];
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '28px 32px 12px', flexWrap: 'wrap' }}>
      {steps.map((s, i) => {
        const isActive = s.num === activePill;
        const isDone = s.num < activePill;
        return (
          <span key={s.num} style={{ display: 'contents' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 100,
              background: isActive ? T.ink : isDone ? T.accentSoft : 'transparent',
              color: isActive ? T.bg : isDone ? T.accentDeep : T.inkMuted,
              fontSize: 13, fontWeight: 500, fontFamily: font, transition: 'all 0.3s ease',
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600,
                background: isActive ? 'rgba(255,255,255,0.15)' : isDone ? T.accent : T.line,
                color: isActive ? 'inherit' : isDone ? 'white' : T.inkMuted,
              }}>
                {isDone ? '✓' : s.num}
              </span>
              {s.label}
            </div>
            {i < steps.length - 1 && <div style={{ width: 24, height: 1, background: T.lineStrong }} />}
          </span>
        );
      })}
    </nav>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function HomePage() {
  const [step, setStep] = useState<Step>(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [scopes, setScopes] = useState<Scopes>({ dak: false, gevel: false });
  const [config, setConfig] = useState<Config>(defaultConfig());
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const activePill = step === 1 ? 1 : step === 2 ? 2 : step === 3 ? 3 : step === 'loading' ? 3 : 4;

  /* ---- File handling ---- */
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { setError('Alleen afbeeldingen (JPG, PNG, WEBP).'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Maximaal 10 MB.'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = e => { setPhotoUrl(e.target?.result as string); setStep(2); };
    reader.readAsDataURL(file);
  }, []);

  /* ---- Scope toggle ---- */
  const toggleScope = useCallback((s: keyof Scopes) => {
    setScopes(prev => ({ ...prev, [s]: !prev[s] }));
  }, []);

  /* ---- Config updates ---- */
  const updateDak = useCallback(<K extends keyof Config['dak']>(field: K, value: Config['dak'][K]) => {
    setConfig(prev => ({ ...prev, dak: { ...prev.dak, [field]: value } }));
  }, []);

  const updateGevel = useCallback(<K extends keyof Config['gevel']>(field: K, value: Config['gevel'][K]) => {
    setConfig(prev => ({ ...prev, gevel: { ...prev.gevel, [field]: value } }));
  }, []);

  /* ---- Generate ---- */
  const generate = useCallback(async () => {
    if (!photoUrl) return;
    setStep('loading');
    setProgress(0);

    const iv = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 12 + 4, 90));
    }, 200);

    try {
      const prompt = buildRichPrompt(config, scopes);

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: photoUrl, prompt }),
      });

      const data = await res.json();
      clearInterval(iv);
      setProgress(100);
      setTimeout(() => {
        setResultUrl(data.imageUrl ?? photoUrl);
        setStep('result');
      }, 400);
    } catch {
      clearInterval(iv);
      setError('Generatie mislukt. Probeer opnieuw.');
      setStep(3);
    }
  }, [photoUrl, config, scopes]);

  /* ---- Reset ---- */
  const reset = useCallback(() => {
    setStep(1); setPhotoUrl(null); setResultUrl(null);
    setScopes({ dak: false, gevel: false }); setConfig(defaultConfig());
    setError(''); setProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.line}`, background: T.surface }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: serif, fontSize: 20, fontWeight: 600, color: T.ink }}>
          <div style={{ width: 32, height: 32, background: T.ink, borderRadius: 6, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, transparent 49%, ${T.accent} 49%, ${T.accent} 51%, transparent 51%)` }} />
          </div>
          Renovision
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: T.accentDeep, fontFamily: font, background: T.accentSoft, padding: '4px 12px', borderRadius: 100, fontWeight: 600 }}>
            Demo
          </span>
        </div>
      </header>

      {/* Stepper */}
      <Stepper activePill={activePill} />

      {/* Main content */}
      <main style={{ padding: '24px 32px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1100 }}>
          {step === 1 && (
            <Step1Upload
              onFile={handleFile}
              error={error}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              fileRef={fileRef}
            />
          )}
          {step === 2 && photoUrl && (
            <Step2Scope
              photoUrl={photoUrl}
              scopes={scopes}
              config={config}
              onToggle={toggleScope}
              onDakChange={updateDak}
              onGevelChange={updateGevel}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && photoUrl && (
            <Step3Config
              photoUrl={photoUrl}
              scopes={scopes}
              config={config}
              onDakChange={updateDak}
              onGevelChange={updateGevel}
              onBack={() => setStep(2)}
              onGenerate={generate}
            />
          )}
          {step === 'loading' && photoUrl && (
            <StepLoading photoUrl={photoUrl} progress={progress} />
          )}
          {step === 'result' && photoUrl && resultUrl && (
            <StepResult
              photoUrl={photoUrl}
              resultUrl={resultUrl}
              scopes={scopes}
              config={config}
              onRestart={reset}
              onAdjust={() => setStep(3)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
