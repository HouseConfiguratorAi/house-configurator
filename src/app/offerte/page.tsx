'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHouseStore } from '@/store/houseStore';
import { useOfferteStore, calcTotalen, formatEuro } from '@/store/offerteStore';
import { buildRegelsFromConfig } from '@/lib/offerteBuilder';
import clsx from 'clsx';

type Section = 'bedrijf' | 'klant' | 'regels' | 'extra';

const Input = ({ label, value, onChange, placeholder = '', type = 'text', className = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; className?: string;
}) => (
  <div className={className}>
    <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-surface-elevated border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-700 outline-none focus:border-accent/50 transition-colors"
    />
  </div>
);

export default function OffertePage() {
  const router = useRouter();
  const { originalImage, generatedImage, config } = useHouseStore();
  const { offerte, setBedrijf, setKlant, setRegel, addRegel, removeRegel, setRegels, setNotities, setBetalingstermijn, setGeldigTot, setDatum, setExtraVoorwaarden } = useOfferteStore();
  const [section, setSection] = useState<Section>('bedrijf');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && config && offerte.regels.length === 0) {
      setRegels(buildRegelsFromConfig(config));
      setInitialized(true);
    }
  }, [config, offerte.regels.length, setRegels, initialized]);

  const { excl, btwBedrag, incl } = calcTotalen(offerte.regels);

  const SECTIONS = [
    { id: 'bedrijf', label: 'Uw bedrijf',    icon: '🏢' },
    { id: 'klant',   label: 'Klantgegevens', icon: '👤' },
    { id: 'regels',  label: 'Werkzaamheden', icon: '🔧' },
    { id: 'extra',   label: 'Extra info',    icon: '📝' },
  ] as const;

  return (
    <div className="min-h-screen bg-bg">
      {/* Grid */}
      <div className="pointer-events-none fixed inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(200,169,110,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,110,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <button onClick={() => router.push('/result')} className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Terug
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-black text-[10px] font-bold">HC</span>
          </div>
          <span className="text-white/50 text-sm">Offerte aanmaken</span>
        </div>
        <button
          onClick={() => window.open('/offerte/print', '_blank')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-black text-sm font-semibold transition-all glow-accent-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          PDF afdrukken
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-5 gap-6">

        {/* Left nav */}
        <div className="col-span-1 space-y-1">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest font-mono mb-3 px-2">Secties</p>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left',
                section === s.id
                  ? 'bg-accent/15 text-accent border border-accent/25'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              )}
            >
              <span>{s.icon}</span>
              <span className="font-medium">{s.label}</span>
            </button>
          ))}

          {/* Totaal preview */}
          <div className="mt-6 glass rounded-2xl p-3 space-y-1.5">
            <p className="text-gray-600 text-[10px] uppercase tracking-widest font-mono mb-2">Totaal</p>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Excl. BTW</span>
              <span className="text-white font-mono">{formatEuro(excl)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">BTW</span>
              <span className="text-white font-mono">{formatEuro(btwBedrag)}</span>
            </div>
            <div className="flex justify-between text-xs pt-1.5 border-t border-white/8">
              <span className="text-white font-semibold">Incl. BTW</span>
              <span className="text-accent font-mono font-bold">{formatEuro(incl)}</span>
            </div>
          </div>

          {/* Photo preview */}
          {(originalImage || generatedImage) && (
            <div className="mt-4 space-y-2">
              {originalImage && (
                <div>
                  <p className="text-gray-700 text-[10px] mb-1 font-mono">Voor</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalImage} alt="Voor" className="w-full rounded-xl object-cover aspect-video opacity-60" />
                </div>
              )}
              {generatedImage && (
                <div>
                  <p className="text-accent text-[10px] mb-1 font-mono">Na (AI)</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={generatedImage} alt="Na" className="w-full rounded-xl object-cover aspect-video ring-1 ring-accent/30" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main form */}
        <div className="col-span-4 glass rounded-3xl p-6 border border-white/5">

          {/* ── BEDRIJF ── */}
          {section === 'bedrijf' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-white font-semibold text-lg mb-1">Uw bedrijfsgegevens</h2>
                <p className="text-gray-500 text-sm">Deze worden opgeslagen voor toekomstige offertes.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Bedrijfsnaam *" value={offerte.bedrijf.naam} onChange={(v) => setBedrijf({ naam: v })} placeholder="Renovatie BV" className="col-span-2" />
                <Input label="Adres" value={offerte.bedrijf.adres} onChange={(v) => setBedrijf({ adres: v })} placeholder="Straatnaam 1" />
                <div className="grid grid-cols-3 gap-2">
                  <Input label="Postcode" value={offerte.bedrijf.postcode} onChange={(v) => setBedrijf({ postcode: v })} placeholder="1234 AB" />
                  <Input label="Stad" value={offerte.bedrijf.stad} onChange={(v) => setBedrijf({ stad: v })} placeholder="Amsterdam" className="col-span-2" />
                </div>
                <Input label="Telefoon" value={offerte.bedrijf.telefoon} onChange={(v) => setBedrijf({ telefoon: v })} placeholder="+31 6 12345678" />
                <Input label="E-mail" value={offerte.bedrijf.email} onChange={(v) => setBedrijf({ email: v })} placeholder="info@bedrijf.nl" type="email" />
                <Input label="Website" value={offerte.bedrijf.website} onChange={(v) => setBedrijf({ website: v })} placeholder="www.bedrijf.nl" />
                <Input label="BTW-nummer" value={offerte.bedrijf.btwNummer} onChange={(v) => setBedrijf({ btwNummer: v })} placeholder="NL123456789B01" />
                <Input label="KVK-nummer" value={offerte.bedrijf.kvkNummer} onChange={(v) => setBedrijf({ kvkNummer: v })} placeholder="12345678" />
                <Input label="IBAN" value={offerte.bedrijf.ibanNummer} onChange={(v) => setBedrijf({ ibanNummer: v })} placeholder="NL91 ABNA 0417 1643 00" />
              </div>
              <button onClick={() => setSection('klant')} className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-accent rounded-xl text-black text-sm font-semibold">
                Volgende → Klantgegevens
              </button>
            </div>
          )}

          {/* ── KLANT ── */}
          {section === 'klant' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-white font-semibold text-lg mb-1">Klantgegevens</h2>
                <p className="text-gray-500 text-sm">Voor wie is deze offerte bestemd?</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 grid grid-cols-3 gap-4">
                  <Input label="Naam / Bedrijf *" value={offerte.klant.naam} onChange={(v) => setKlant({ naam: v })} placeholder="Jan de Vries" className="col-span-2" />
                </div>
                <Input label="Adres woning" value={offerte.klant.adres} onChange={(v) => setKlant({ adres: v })} placeholder="Dorpsstraat 12" />
                <div className="grid grid-cols-3 gap-2">
                  <Input label="Postcode" value={offerte.klant.postcode} onChange={(v) => setKlant({ postcode: v })} placeholder="5678 CD" />
                  <Input label="Stad" value={offerte.klant.stad} onChange={(v) => setKlant({ stad: v })} placeholder="Rotterdam" className="col-span-2" />
                </div>
                <Input label="Telefoon" value={offerte.klant.telefoon} onChange={(v) => setKlant({ telefoon: v })} placeholder="+31 6 98765432" />
                <Input label="E-mail" value={offerte.klant.email} onChange={(v) => setKlant({ email: v })} placeholder="klant@email.nl" type="email" />
                <div className="col-span-2 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-1">Offerte datum</label>
                    <input type="date" value={offerte.datum} onChange={(e) => setDatum(e.target.value)}
                      className="w-full bg-surface-elevated border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-accent/50" />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-1">Geldig tot</label>
                    <input type="date" value={offerte.geldigTot} onChange={(e) => setGeldigTot(e.target.value)}
                      className="w-full bg-surface-elevated border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-accent/50" />
                  </div>
                  <Input label="Offerte nummer" value={offerte.nummer} onChange={() => {}} placeholder="OFF-2026-001" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSection('bedrijf')} className="px-5 py-2.5 text-gray-500 hover:text-white text-sm transition-colors">← Terug</button>
                <button onClick={() => setSection('regels')} className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-accent rounded-xl text-black text-sm font-semibold">
                  Volgende → Werkzaamheden
                </button>
              </div>
            </div>
          )}

          {/* ── REGELS ── */}
          {section === 'regels' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-white font-semibold text-lg mb-1">Werkzaamheden & Prijzen</h2>
                <p className="text-gray-500 text-sm">Auto-ingevuld op basis van je AI-configuratie. Pas prijzen aan.</p>
              </div>

              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-2 text-[10px] text-gray-600 uppercase tracking-widest font-mono">
                <div className="col-span-4">Omschrijving</div>
                <div className="col-span-3">Detail</div>
                <div className="col-span-1 text-center">Aantal</div>
                <div className="col-span-1 text-center">Eenheid</div>
                <div className="col-span-1 text-right">Prijs</div>
                <div className="col-span-1 text-center">BTW%</div>
                <div className="col-span-1" />
              </div>

              <div className="space-y-2">
                {offerte.regels.map((r) => (
                  <div key={r.id} className="grid grid-cols-12 gap-2 items-center bg-surface-elevated rounded-xl p-2.5 border border-white/5 group">
                    <input value={r.omschrijving} onChange={(e) => setRegel(r.id, { omschrijving: e.target.value })}
                      placeholder="Omschrijving"
                      className="col-span-4 bg-transparent text-white text-sm outline-none focus:text-accent placeholder-gray-700 transition-colors" />
                    <input value={r.detail} onChange={(e) => setRegel(r.id, { detail: e.target.value })}
                      placeholder="Detail / specificatie"
                      className="col-span-3 bg-transparent text-gray-400 text-xs outline-none focus:text-white placeholder-gray-700 transition-colors" />
                    <input type="number" value={r.aantal} onChange={(e) => setRegel(r.id, { aantal: Number(e.target.value) })}
                      className="col-span-1 bg-surface-high border border-white/8 rounded-lg px-2 py-1 text-white text-xs text-center outline-none focus:border-accent/50" />
                    <select value={r.eenheid} onChange={(e) => setRegel(r.id, { eenheid: e.target.value })}
                      className="col-span-1 bg-surface-high border border-white/8 rounded-lg px-1 py-1 text-white text-xs outline-none focus:border-accent/50">
                      {['m²', 'st', 'm', 'uur', 'dag', 'ls'].map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <div className="col-span-1 flex items-center gap-0.5">
                      <span className="text-gray-600 text-xs">€</span>
                      <input type="number" value={r.prijs} onChange={(e) => setRegel(r.id, { prijs: Number(e.target.value) })}
                        className="w-full bg-surface-high border border-white/8 rounded-lg px-1.5 py-1 text-white text-xs text-right outline-none focus:border-accent/50" />
                    </div>
                    <select value={r.btw} onChange={(e) => setRegel(r.id, { btw: Number(e.target.value) })}
                      className="col-span-1 bg-surface-high border border-white/8 rounded-lg px-1 py-1 text-white text-xs outline-none focus:border-accent/50 text-center">
                      {[0, 9, 21].map((p) => <option key={p} value={p}>{p}%</option>)}
                    </select>
                    <button onClick={() => removeRegel(r.id)} className="col-span-1 text-gray-700 hover:text-red-400 text-xs transition-colors opacity-0 group-hover:opacity-100 text-center">✕</button>
                  </div>
                ))}
              </div>

              <button onClick={addRegel} className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-gray-600 hover:text-white hover:border-accent/30 text-sm transition-all">
                + Regel toevoegen
              </button>

              {/* Totalen */}
              <div className="glass rounded-2xl p-4 ml-auto max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotaal excl. BTW</span>
                  <span className="text-white font-mono">{formatEuro(excl)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">BTW</span>
                  <span className="text-white font-mono">{formatEuro(btwBedrag)}</span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-white/10">
                  <span className="text-white font-semibold">Totaal incl. BTW</span>
                  <span className="text-accent font-mono font-bold text-lg">{formatEuro(incl)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSection('klant')} className="px-5 py-2.5 text-gray-500 hover:text-white text-sm transition-colors">← Terug</button>
                <button onClick={() => setSection('extra')} className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-accent rounded-xl text-black text-sm font-semibold">
                  Volgende → Afronden
                </button>
              </div>
            </div>
          )}

          {/* ── EXTRA ── */}
          {section === 'extra' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-white font-semibold text-lg mb-1">Extra informatie</h2>
                <p className="text-gray-500 text-sm">Notities, betalingstermijn en voorwaarden.</p>
              </div>
              <Input label="Betalingstermijn" value={offerte.betalingstermijn} onChange={(v) => setBetalingstermijn(v)} placeholder="14 dagen na factuurdatum" />
              <div>
                <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-1">Notities voor klant</label>
                <textarea value={offerte.notities} onChange={(e) => setNotities(e.target.value)}
                  rows={3} placeholder="Extra opmerkingen, startdatum, garantie…"
                  className="w-full bg-surface-elevated border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-700 outline-none focus:border-accent/50 resize-none" />
              </div>
              <div>
                <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-1">Algemene voorwaarden</label>
                <textarea value={offerte.extraVoorwaarden} onChange={(e) => setExtraVoorwaarden(e.target.value)}
                  rows={4} placeholder="Uw algemene voorwaarden…"
                  className="w-full bg-surface-elevated border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-700 outline-none focus:border-accent/50 resize-none" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSection('regels')} className="px-5 py-2.5 text-gray-500 hover:text-white text-sm transition-colors">← Terug</button>
                <button
                  onClick={() => window.open('/offerte/print', '_blank')}
                  className="ml-auto flex items-center gap-2 px-6 py-3 bg-accent rounded-xl text-black font-bold glow-accent-sm transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Offerte genereren als PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
