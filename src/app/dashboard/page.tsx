'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useHouseStore } from '@/store/houseStore';
import { useOfferteStore, formatEuro, formatDate, calcTotalen } from '@/store/offerteStore';
import type { BedrijfInfo, Offerte } from '@/lib/offerteTypes';
import type { SavedVersion } from '@/lib/types';

type Tab = 'projecten' | 'offertes' | 'bedrijf' | 'instellingen';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('projecten');
  const [bedrijfSaved, setBedrijfSaved] = useState(false);

  const { savedVersions } = useHouseStore();
  const { offerte, setBedrijf } = useOfferteStore();

  const [bedrijfForm, setBedrijfForm] = useState<BedrijfInfo>({ ...offerte.bedrijf });

  const totalen = calcTotalen(offerte.regels);

  function handleBedrijfSave() {
    setBedrijf(bedrijfForm);
    setBedrijfSaved(true);
    setTimeout(() => setBedrijfSaved(false), 3000);
  }

  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: 'projecten', label: 'Projecten', emoji: '🏠' },
    { id: 'offertes', label: 'Offertes', emoji: '📋' },
    { id: 'bedrijf', label: 'Bedrijfsprofiel', emoji: '🏢' },
    { id: 'instellingen', label: 'Instellingen', emoji: '⚙️' },
  ];

  return (
    <main className="min-h-screen bg-bg relative overflow-x-hidden">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(200,169,110,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,110,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/4 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-black text-xs font-bold font-mono">HC</span>
          </div>
          <div>
            <span className="text-white font-medium text-sm">House Configurator</span>
            <span className="text-accent text-xs font-mono ml-2">Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-300 text-xs font-mono transition-colors border border-white/8 px-3 py-1.5 rounded-xl hover:border-white/16"
          >
            ← Terug
          </Link>
          <UserButton
            afterSignOutUrl="/"
            appearance={{ elements: { avatarBox: 'w-8 h-8' } }}
          />
        </div>
      </header>

      <div className="relative z-10 flex h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 border-r border-white/6 p-4 flex flex-col gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-accent/12 text-accent border border-accent/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/4'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}

          <div className="flex-1" />

          <div className="px-3 py-2">
            <div className="text-xs font-mono text-gray-700">v1.0.0-beta</div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'projecten' && (
            <ProjectenTab savedVersions={savedVersions} />
          )}
          {activeTab === 'offertes' && (
            <OffertesTab offerte={offerte} totalen={totalen} />
          )}
          {activeTab === 'bedrijf' && (
            <BedrijfTab
              bedrijfForm={bedrijfForm}
              setBedrijfForm={setBedrijfForm}
              onSave={handleBedrijfSave}
              saved={bedrijfSaved}
            />
          )}
          {activeTab === 'instellingen' && <InstellingenTab />}
        </main>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Projecten tab                                                        */
/* ------------------------------------------------------------------ */
function ProjectenTab({ savedVersions }: { savedVersions: SavedVersion[] }) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-medium">Projecten</h1>
          <p className="text-gray-500 text-sm mt-0.5">Uw opgeslagen configuraties</p>
        </div>
        <Link
          href="/"
          className="bg-accent hover:bg-accent-hover text-black text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          + Nieuw project
        </Link>
      </div>

      {savedVersions.length === 0 ? (
        <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-white/8 flex items-center justify-center mb-4">
            <span className="text-3xl">🏠</span>
          </div>
          <h3 className="text-white font-medium mb-2">Nog geen projecten</h3>
          <p className="text-gray-500 text-sm max-w-xs mb-6">
            Upload een foto van uw woning en sla een configuratie op om hem hier te zien.
          </p>
          <Link
            href="/"
            className="bg-accent hover:bg-accent-hover text-black text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Start eerste project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedVersions.map((v) => (
            <div key={v.id} className="glass rounded-2xl overflow-hidden group">
              <div className="aspect-video relative bg-surface-elevated">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.imageUrl}
                  alt={v.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4">
                <h3 className="text-white text-sm font-medium mb-1">{v.label}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
                  <span>{v.lighting}</span>
                  <span>·</span>
                  <span>{v.season}</span>
                  <span>·</span>
                  <span>{new Date(v.createdAt).toLocaleDateString('nl-NL')}</span>
                </div>
                {v.config.gevelbekleding && (
                  <div className="mt-2 text-xs text-gray-500">
                    {v.config.gevelbekleding}
                    {v.config.gevelkleur ? ` · ${v.config.gevelkleur}` : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Offertes tab                                                         */
/* ------------------------------------------------------------------ */
function OffertesTab({
  offerte,
  totalen,
}: {
  offerte: Offerte;
  totalen: { excl: number; btwBedrag: number; incl: number };
}) {
  const hasData = offerte.klant.naam || offerte.regels.length > 0;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-medium">Offertes</h1>
          <p className="text-gray-500 text-sm mt-0.5">Uw offertes en documenten</p>
        </div>
        <Link
          href="/offerte"
          className="bg-accent hover:bg-accent-hover text-black text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          + Nieuwe offerte
        </Link>
      </div>

      {!hasData ? (
        <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-white/8 flex items-center justify-center mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-white font-medium mb-2">Nog geen offertes</h3>
          <p className="text-gray-500 text-sm max-w-xs mb-6">
            Maak een professionele offerte aan via de offerte pagina.
          </p>
          <Link
            href="/offerte"
            className="bg-accent hover:bg-accent-hover text-black text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Maak offerte
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-accent font-mono text-sm font-medium">{offerte.nummer}</span>
                  <span className="bg-green-500/12 text-green-400 text-xs font-mono px-2 py-0.5 rounded-full border border-green-500/20">
                    Actief
                  </span>
                </div>
                <h3 className="text-white font-medium">
                  {offerte.klant.naam || 'Onbekende klant'}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-mono">
                  <span>Datum: {formatDate(offerte.datum)}</span>
                  <span>·</span>
                  <span>Geldig tot: {formatDate(offerte.geldigTot)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold text-lg">{formatEuro(totalen.incl)}</div>
                <div className="text-gray-500 text-xs font-mono">incl. BTW</div>
              </div>
            </div>

            {offerte.regels.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-elevated rounded-xl p-3 text-center">
                    <div className="text-white font-medium text-sm">{formatEuro(totalen.excl)}</div>
                    <div className="text-gray-600 text-xs font-mono">excl. BTW</div>
                  </div>
                  <div className="bg-surface-elevated rounded-xl p-3 text-center">
                    <div className="text-white font-medium text-sm">{formatEuro(totalen.btwBedrag)}</div>
                    <div className="text-gray-600 text-xs font-mono">BTW</div>
                  </div>
                  <div className="bg-surface-elevated rounded-xl p-3 text-center">
                    <div className="text-white font-medium text-sm">{offerte.regels.length}</div>
                    <div className="text-gray-600 text-xs font-mono">regels</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <Link
                href="/offerte"
                className="flex-1 text-center bg-surface-elevated hover:bg-surface-high border border-white/8 text-gray-300 text-sm px-4 py-2 rounded-xl transition-colors"
              >
                Bewerken
              </Link>
              <Link
                href="/offerte/print"
                className="flex-1 text-center bg-accent hover:bg-accent-hover text-black text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Bekijk PDF
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bedrijfsprofiel tab                                                  */
/* ------------------------------------------------------------------ */
function BedrijfTab({
  bedrijfForm,
  setBedrijfForm,
  onSave,
  saved,
}: {
  bedrijfForm: BedrijfInfo;
  setBedrijfForm: (v: BedrijfInfo) => void;
  onSave: () => void;
  saved: boolean;
}) {
  function update(field: keyof BedrijfInfo, value: string) {
    setBedrijfForm({ ...bedrijfForm, [field]: value });
  }

  const fields: { key: keyof BedrijfInfo; label: string; placeholder: string; colSpan?: boolean }[] = [
    { key: 'naam', label: 'Bedrijfsnaam', placeholder: 'Renovatie BV', colSpan: true },
    { key: 'adres', label: 'Adres', placeholder: 'Hoofdstraat 1', colSpan: true },
    { key: 'postcode', label: 'Postcode', placeholder: '1234 AB' },
    { key: 'stad', label: 'Stad', placeholder: 'Amsterdam' },
    { key: 'telefoon', label: 'Telefoon', placeholder: '+31 6 12345678' },
    { key: 'email', label: 'E-mail', placeholder: 'info@bedrijf.nl' },
    { key: 'website', label: 'Website', placeholder: 'www.bedrijf.nl', colSpan: true },
    { key: 'btwNummer', label: 'BTW-nummer', placeholder: 'NL123456789B01' },
    { key: 'kvkNummer', label: 'KVK-nummer', placeholder: '12345678' },
    { key: 'ibanNummer', label: 'IBAN', placeholder: 'NL91ABNA0417164300', colSpan: true },
  ];

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6">
        <h1 className="text-white text-xl font-medium">Bedrijfsprofiel</h1>
        <p className="text-gray-500 text-sm mt-0.5">Automatisch gebruikt in al uw offertes</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key} className={f.colSpan ? 'col-span-2' : ''}>
              <label className="block text-gray-400 text-xs font-mono mb-1.5">{f.label}</label>
              <input
                type="text"
                value={bedrijfForm[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full bg-surface-elevated border border-white/10 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-accent/40 placeholder-gray-700 transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/40" />
            Automatisch gebruikt in al uw offertes
          </div>
          <button
            onClick={onSave}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-accent hover:bg-accent-hover text-black'
            }`}
          >
            {saved ? '✓ Opgeslagen' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Instellingen tab                                                     */
/* ------------------------------------------------------------------ */
function InstellingenTab() {
  return (
    <div className="animate-fade-in max-w-xl">
      <div className="mb-6">
        <h1 className="text-white text-xl font-medium">Instellingen</h1>
        <p className="text-gray-500 text-sm mt-0.5">App en account instellingen</p>
      </div>

      <div className="space-y-4">
        {/* App info */}
        <div className="glass rounded-2xl p-5">
          <h2 className="text-white text-sm font-medium mb-4">App informatie</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Versie</span>
              <span className="text-white text-sm font-mono">1.0.0-beta</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Thema</span>
              <span className="text-white text-sm">Donker</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Model</span>
              <span className="text-accent text-sm font-mono">SDXL img2img</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Status</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-sm">Actief</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="glass rounded-2xl p-5">
          <h2 className="text-white text-sm font-medium mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl border border-white/6">
              <div>
                <div className="text-white text-sm">Account verwijderen</div>
                <div className="text-gray-600 text-xs mt-0.5">Verwijder uw account en alle data</div>
              </div>
              <button
                disabled
                className="text-red-400/40 text-xs border border-red-400/20 px-3 py-1.5 rounded-xl cursor-not-allowed opacity-50"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="glass rounded-2xl p-5">
          <h2 className="text-white text-sm font-medium mb-4">Navigatie</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: '/', label: '🏠 Upload' },
              { href: '/configure', label: '🎨 Configureer' },
              { href: '/result', label: '✨ Resultaat' },
              { href: '/offerte', label: '📄 Offerte' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-surface-elevated hover:bg-surface-high border border-white/8 text-gray-300 text-sm px-3 py-2 rounded-xl transition-colors text-center"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
