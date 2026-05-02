'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';

/* ================================================================
   TYPES
   ================================================================ */
type Step = 1 | 2 | 3 | 'loading' | 'result';

interface Config {
  dak: { type: string | null; bedekking: string | null; kleur: string | null; extras: string[] };
  gevel: { afwerking: string | null; gevels: string[]; kleur: string | null; extras: string[] };
}
interface Scopes { dak: boolean; gevel: boolean; }

/* ================================================================
   OPTIONS
   ================================================================ */
const DAK_TYPES = ['Zadeldak', 'Plat dak', 'Schilddak', 'Mansardedak'];
const DAK_BEDEKKING = ['Dakpannen', 'Leien', 'EPDM', 'Roofing/bitumen', 'Metalen dakpanelen'];
const DAK_KLEUREN = [
  { name: 'Antraciet', hex: '#2d3033' },
  { name: 'Zwart', hex: '#0e0e0e' },
  { name: 'Roodbruin', hex: '#7d3a25' },
  { name: 'Grijs', hex: '#7a7d80' },
  { name: 'Terracotta', hex: '#b85c3a' },
];
const DAK_EXTRAS = ['Dakgoten vervangen', 'Isolatie toevoegen', 'Dakkapel behouden', 'Zonnepanelen behouden'];

const GEVEL_AFWERKING = ['Crepi', 'Gevelpleister', 'Houten gevelbekleding', 'Steenstrips', 'Gevelpanelen', 'Schilderwerk'];
const GEVEL_GEVELS = ['Voorgevel', 'Achtergevel', 'Linkergevel', 'Rechtergevel', 'Alle gevels'];
const GEVEL_KLEUREN = [
  { name: 'Wit', hex: '#f5f2ea' },
  { name: 'Crème', hex: '#ede4d3' },
  { name: 'Lichtgrijs', hex: '#cccdc8' },
  { name: 'Donkergrijs', hex: '#5a5d60' },
  { name: 'Beige', hex: '#c8b89a' },
  { name: 'Zandkleur', hex: '#d8c79e' },
];
const GEVEL_EXTRAS = ['Gevelisolatie toevoegen', 'Raamomlijsting behouden', 'Plint behouden', 'Regenpijpen behouden'];

const defaultConfig = (): Config => ({
  dak: { type: null, bedekking: null, kleur: null, extras: [] },
  gevel: { afwerking: null, gevels: [], kleur: null, extras: [] },
});

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

  return (
    <div>
      <StepHeader
        eyebrow="Stap 3 van 3"
        title={title}
        subtitle="Stel de gewenste materialen, kleuren en details in. Je kan later altijd aanpassen."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)', gap: 32, alignItems: 'start' }}>
        {/* Sticky photo preview */}
        <div style={{ position: 'sticky', top: 20, background: T.surface, borderRadius: 20, padding: 16, boxShadow: '0 4px 12px rgba(20,20,20,0.06)', border: `1px solid ${T.line}` }}>
          <img src={photoUrl} alt="Origineel" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8, display: 'block' }} />
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.accentDeep, background: T.accentSoft, padding: '5px 12px', borderRadius: 100, fontWeight: 600, fontFamily: font }}>Origineel</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {scopes.dak && <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: T.accentSoft, color: T.accentDeep, fontFamily: font }}>Dak</span>}
              {scopes.gevel && <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: T.accentSoft, color: T.accentDeep, fontFamily: font }}>Gevel</span>}
            </div>
          </div>
        </div>

        {/* Config panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {scopes.dak && (
            <ConfigSection
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M3 12L12 4l9 8v8H3v-8z" /></svg>}
              title="Dak"
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 }}>
                  {DAK_KLEUREN.map(c => (
                    <ColorSwatch key={c.name} name={c.name} hex={c.hex} selected={config.dak.kleur === c.name} onClick={() => onDakChange('kleur', c.name)} />
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
              title="Gevel"
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 }}>
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
        <button onClick={onGenerate} style={{ padding: '14px 32px', borderRadius: 100, fontSize: 15, fontWeight: 600, background: T.accent, color: 'white', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: font, transition: 'all 0.2s ease' }}>
          Configureren →
        </button>
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
function StepResult({ photoUrl, resultUrl, scopes, config, onRestart, onAdjust }: {
  photoUrl: string;
  resultUrl: string;
  scopes: Scopes;
  config: Config;
  onRestart: () => void;
  onAdjust: () => void;
}) {
  const row = (label: string, value: string | null) => value ? (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, gap: 12 }}>
      <span style={{ color: T.inkMuted, fontFamily: font }}>{label}</span>
      <span style={{ color: T.ink, fontWeight: 500, textAlign: 'right', fontFamily: font }}>{value}</span>
    </div>
  ) : null;

  const rowList = (label: string, arr: string[]) => arr.length > 0 ? (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, gap: 12 }}>
      <span style={{ color: T.inkMuted, fontFamily: font }}>{label}</span>
      <span style={{ color: T.ink, fontWeight: 500, textAlign: 'right', fontFamily: font }}>{arr.join(', ')}</span>
    </div>
  ) : null;

  const sectionTitle = (t: string) => (
    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.accentDeep, fontWeight: 700, marginBottom: 12, fontFamily: font }}>{t}</div>
  );

  return (
    <div>
      <StepHeader eyebrow="✓ Klaar" title="Je foto is klaar" subtitle="Bekijk je gevisualiseerde resultaat en de gekozen configuratie hieronder." green />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 32, alignItems: 'start' }}>
        {/* Photos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: T.surface, borderRadius: 20, padding: 16, boxShadow: '0 4px 12px rgba(20,20,20,0.06)', border: `1px solid ${T.line}` }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.inkMuted, fontWeight: 600, marginBottom: 8, fontFamily: font }}>Na</div>
            <img src={resultUrl} alt="Resultaat" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8, display: 'block' }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1a4a2e', color: 'white', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, padding: '6px 12px', borderRadius: 100, marginTop: 14, fontFamily: font }}>
              <span style={{ width: 6, height: 6, background: '#34d399', borderRadius: '50%' }} />
              Visualisatie voltooid
            </div>
          </div>
          <div style={{ background: T.surface, borderRadius: 20, padding: 16, border: `1px solid ${T.line}` }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.inkMuted, fontWeight: 600, marginBottom: 8, fontFamily: font }}>Origineel</div>
            <img src={photoUrl} alt="Origineel" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8, display: 'block' }} />
          </div>
        </div>

        {/* Summary */}
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 20, padding: 24 }}>
          <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 500, marginBottom: 4, color: T.ink }}>Configuratie</h3>
          <p style={{ fontSize: 13, color: T.inkMuted, marginBottom: 20, fontFamily: font }}>Overzicht van de gekozen opties</p>

          {/* Onderdelen */}
          <div style={{ paddingTop: 0 }}>
            {sectionTitle('Onderdelen')}
            {row('Geselecteerd', [scopes.dak && 'Dak', scopes.gevel && 'Gevel'].filter(Boolean).join(', '))}
          </div>

          {scopes.dak && (
            <div style={{ paddingTop: 16, marginTop: 16, borderTop: `1px solid ${T.line}` }}>
              {sectionTitle('Dak')}
              {row('Type', config.dak.type)}
              {row('Bedekking', config.dak.bedekking)}
              {row('Kleur', config.dak.kleur)}
              {rowList('Extra', config.dak.extras)}
            </div>
          )}

          {scopes.gevel && (
            <div style={{ paddingTop: 16, marginTop: 16, borderTop: `1px solid ${T.line}` }}>
              {sectionTitle('Gevel')}
              {row('Afwerking', config.gevel.afwerking)}
              {rowList('Gevels', config.gevel.gevels)}
              {row('Kleur', config.gevel.kleur)}
              {rowList('Extra', config.gevel.extras)}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.line}` }}>
            <button onClick={onRestart} style={{ padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 600, background: T.ink, color: T.bg, border: 'none', cursor: 'pointer', fontFamily: font }}>
              Nieuwe foto uploaden
            </button>
            <button onClick={onAdjust} style={{ padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 600, background: T.surface, color: T.ink, border: `1px solid ${T.lineStrong}`, cursor: 'pointer', fontFamily: font }}>
              Configuratie aanpassen
            </button>
            <Link href="/offerte" style={{ padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 600, background: T.accentSoft, color: T.accentDeep, textAlign: 'center', textDecoration: 'none', display: 'block', fontFamily: font }}>
              📄 Offerte aanmaken
            </Link>
          </div>
        </div>
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
      // Map to HouseConfig for the existing API route
      const houseConfig = {
        roof: config.dak.kleur ?? 'Antraciet',
        facade: config.gevel.kleur ?? 'Wit',
        windows: 'Wit',
        door: 'Antraciet',
        facadeMaterial: config.gevel.afwerking ?? 'Schilderwerk',
        roofMaterial: config.dak.bedekking ?? 'Dakpannen',
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: photoUrl, config: houseConfig, lighting: 'day', season: 'summer' }),
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
  }, [photoUrl, config]);

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
