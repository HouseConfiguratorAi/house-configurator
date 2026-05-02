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
   STEP 2 — SCOPE SELECTION
   ================================================================ */
function Step2Scope({
  photoUrl, scopes, onToggle, onBack, onNext,
}: {
  photoUrl: string;
  scopes: Scopes;
  onToggle: (s: keyof Scopes) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const anySelected = scopes.dak || scopes.gevel;
  return (
    <div>
      <StepHeader
        eyebrow="Stap 2 van 3"
        title="Wat wil je configureren?"
        subtitle="Kies één of beide onderdelen. Je kan in de volgende stap alle opties verfijnen."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>
        {/* Photo preview */}
        <div style={{ background: T.surface, borderRadius: 20, padding: 16, boxShadow: '0 1px 3px rgba(20,20,20,0.06)', border: `1px solid ${T.line}` }}>
          <img src={photoUrl} alt="Jouw foto" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8, display: 'block' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span style={{ color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: 11, fontFamily: font }}>Jouw foto</span>
            <button onClick={onBack} style={{ color: T.accentDeep, fontWeight: 500, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: font }}>Wijzigen</button>
          </div>
        </div>

        {/* Scope cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {([
            {
              key: 'dak' as const, title: 'Dak',
              desc: 'Vervanging, type, dakbedekking, kleur en extra elementen zoals isolatie of dakgoten.',
              svg: (
                <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
                  <path d="M4 16L16 6l12 10v10H4V16z" stroke="#1a1d1f" strokeWidth="1.5" />
                  <path d="M4 16L16 6l12 10" stroke="#c8553d" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              ),
            },
            {
              key: 'gevel' as const, title: 'Gevel',
              desc: 'Afwerking, te bewerken gevels, kleur en details zoals raamomlijsting of plint.',
              svg: (
                <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
                  <rect x="6" y="6" width="20" height="22" stroke="#1a1d1f" strokeWidth="1.5" />
                  <rect x="6" y="6" width="20" height="22" fill="#c8553d" fillOpacity="0.15" />
                  <rect x="10" y="11" width="4" height="5" stroke="#1a1d1f" strokeWidth="1.2" />
                  <rect x="18" y="11" width="4" height="5" stroke="#1a1d1f" strokeWidth="1.2" />
                  <rect x="14" y="20" width="4" height="8" stroke="#1a1d1f" strokeWidth="1.2" />
                </svg>
              ),
            },
          ]).map(card => {
            const sel = scopes[card.key];
            return (
              <button
                key={card.key}
                onClick={() => onToggle(card.key)}
                style={{
                  background: sel ? T.accentSoft : T.surface,
                  border: `2px solid ${sel ? T.accent : T.line}`,
                  borderRadius: 20, padding: '32px 28px',
                  cursor: 'pointer', textAlign: 'left', position: 'relative',
                  transition: 'all 0.25s ease',
                }}
              >
                <div style={{
                  position: 'absolute', top: 20, right: 20, width: 28, height: 28,
                  border: `2px solid ${sel ? T.accent : T.lineStrong}`,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: sel ? T.accent : T.surface, color: 'white', fontSize: 12, fontWeight: 700,
                }}>
                  {sel && '✓'}
                </div>
                <div style={{ width: 64, height: 64, background: sel ? T.surface : T.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  {card.svg}
                </div>
                <h3 style={{ fontFamily: serif, fontSize: 24, fontWeight: 500, marginBottom: 6, color: T.ink }}>{card.title}</h3>
                <p style={{ fontSize: 14, color: T.inkSoft, lineHeight: 1.45, fontFamily: font }}>{card.desc}</p>
              </button>
            );
          })}
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
            display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: font,
            transition: 'all 0.2s ease',
          }}
        >
          Volgende →
        </button>
      </div>
    </div>
  );
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

          {/* Visual quick options card */}
          <div style={{ background: T.surface, borderRadius: 20, padding: 20, border: `1px solid ${T.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: serif, fontSize: 17, fontWeight: 500, color: T.ink }}>Visuele opties</span>
              {selectedCount > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, background: T.accent, color: 'white', borderRadius: 100, padding: '2px 9px', fontFamily: font }}>{selectedCount} gekozen</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: T.inkMuted, fontFamily: font, marginBottom: 4 }}>Meest zichtbare aanpassingen</p>

            {scopes.dak && (
              <>
                <QuickOptionBlock title="☀️ Zonnepanelen — aantal">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {DAK_ZONNEPANELEN.map(opt => (
                      <Pill key={opt} label={opt} selected={config.dak.zonnepanelen === opt} onClick={() => onDakChange('zonnepanelen', opt)} />
                    ))}
                  </div>
                </QuickOptionBlock>
                <QuickOptionBlock title="🏠 Dakkapel">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {DAK_KAPEL.map(opt => (
                      <Pill key={opt} label={opt} selected={config.dak.dakkapel === opt} onClick={() => onDakChange('dakkapel', opt)} />
                    ))}
                  </div>
                </QuickOptionBlock>
              </>
            )}

            {scopes.gevel && (
              <>
                <QuickOptionBlock title="🪟 Ramen stijl">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {GEVEL_RAMEN.map(opt => (
                      <Pill key={opt} label={opt} selected={config.gevel.ramen === opt} onClick={() => onGevelChange('ramen', opt)} />
                    ))}
                  </div>
                </QuickOptionBlock>
                <QuickOptionBlock title="🚪 Voordeur stijl">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {GEVEL_DEUR.map(opt => (
                      <Pill key={opt} label={opt} selected={config.gevel.deur === opt} onClick={() => onGevelChange('deur', opt)} />
                    ))}
                  </div>
                </QuickOptionBlock>
                <QuickOptionBlock title="🎨 Kleur voordeur">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {GEVEL_DEURKLEUREN.map(c => (
                      <ColorSwatch key={c.name} name={c.name} hex={c.hex} selected={config.gevel.deurkleur === c.name} onClick={() => onGevelChange('deurkleur', c.name)} />
                    ))}
                  </div>
                </QuickOptionBlock>
              </>
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DAK_TYPES.map(opt => (
                    <Pill key={opt} label={opt} selected={config.dak.type === opt} onClick={() => onDakChange('type', opt)} />
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Dakbedekking">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DAK_BEDEKKING.map(opt => (
                    <Pill key={opt} label={opt} selected={config.dak.bedekking === opt} onClick={() => onDakChange('bedekking', opt)} />
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Kleur dak">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10 }}>
                  {DAK_KLEUREN.map(c => (
                    <ColorSwatch key={c.name} name={c.name} hex={c.hex} selected={config.dak.kleur === c.name} onClick={() => onDakChange('kleur', c.name)} />
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Dakgoot materiaal">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DAK_GOOT.map(opt => (
                    <Pill key={opt} label={opt} selected={config.dak.dakgoot === opt} onClick={() => onDakChange('dakgoot', opt)} />
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Extra opties">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {DAK_EXTRAS.map(opt => (
                    <CheckTile key={opt} label={opt} selected={config.dak.extras.includes(opt)} onClick={() => onDakChange('extras', toggleArr(config.dak.extras, opt))} />
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {GEVEL_AFWERKING.map(opt => (
                    <Pill key={opt} label={opt} selected={config.gevel.afwerking === opt} onClick={() => onGevelChange('afwerking', opt)} />
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Welke gevels?">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {GEVEL_GEVELS.map(opt => (
                    <Pill key={opt} label={opt}
                      selected={config.gevel.gevels.includes(opt)}
                      onClick={() => onGevelChange('gevels', toggleArr(config.gevel.gevels, opt))}
                    />
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Kleur gevel">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10 }}>
                  {GEVEL_KLEUREN.map(c => (
                    <ColorSwatch key={c.name} name={c.name} hex={c.hex} selected={config.gevel.kleur === c.name} onClick={() => onGevelChange('kleur', c.name)} />
                  ))}
                </div>
              </ConfigGroup>
              <ConfigGroup label="Extra opties">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {GEVEL_EXTRAS.map(opt => (
                    <CheckTile key={opt} label={opt} selected={config.gevel.extras.includes(opt)} onClick={() => onGevelChange('extras', toggleArr(config.gevel.extras, opt))} />
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
              onToggle={toggleScope}
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
