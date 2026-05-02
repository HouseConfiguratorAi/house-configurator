'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Offerte, BedrijfInfo, KlantInfo, OfferteRegel } from '@/lib/offerteTypes';

const defaultBedrijf: BedrijfInfo = {
  naam: '', adres: '', postcode: '', stad: '',
  telefoon: '', email: '', website: '',
  btwNummer: '', kvkNummer: '', ibanNummer: '',
};

const defaultKlant: KlantInfo = {
  naam: '', adres: '', postcode: '', stad: '',
  telefoon: '', email: '',
};

function generateNummer(): string {
  const y = new Date().getFullYear();
  const n = String(Math.floor(Math.random() * 900) + 100);
  return `OFF-${y}-${n}`;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function in30days(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

interface OfferteStore {
  offerte: Offerte;
  setBedrijf: (info: Partial<BedrijfInfo>) => void;
  setKlant: (info: Partial<KlantInfo>) => void;
  setRegel: (id: string, update: Partial<OfferteRegel>) => void;
  addRegel: () => void;
  removeRegel: (id: string) => void;
  setRegels: (regels: OfferteRegel[]) => void;
  setNotities: (v: string) => void;
  setBetalingstermijn: (v: string) => void;
  setExtraVoorwaarden: (v: string) => void;
  setDatum: (v: string) => void;
  setGeldigTot: (v: string) => void;
  resetKlant: () => void;
}

export const useOfferteStore = create<OfferteStore>()(
  persist(
    (set) => ({
      offerte: {
        nummer: generateNummer(),
        datum: today(),
        geldigTot: in30days(),
        bedrijf: { ...defaultBedrijf },
        klant: { ...defaultKlant },
        regels: [],
        notities: '',
        betalingstermijn: '14 dagen na factuurdatum',
        extraVoorwaarden: 'Prijzen zijn exclusief BTW tenzij anders vermeld. Offerte is geldig gedurende 30 dagen.',
      },

      setBedrijf: (info) =>
        set((s) => ({ offerte: { ...s.offerte, bedrijf: { ...s.offerte.bedrijf, ...info } } })),

      setKlant: (info) =>
        set((s) => ({ offerte: { ...s.offerte, klant: { ...s.offerte.klant, ...info } } })),

      setRegel: (id, update) =>
        set((s) => ({
          offerte: {
            ...s.offerte,
            regels: s.offerte.regels.map((r) => (r.id === id ? { ...r, ...update } : r)),
          },
        })),

      addRegel: () =>
        set((s) => ({
          offerte: {
            ...s.offerte,
            regels: [
              ...s.offerte.regels,
              { id: Date.now().toString(), omschrijving: '', detail: '', eenheid: 'st', aantal: 1, prijs: 0, btw: 21 },
            ],
          },
        })),

      removeRegel: (id) =>
        set((s) => ({
          offerte: { ...s.offerte, regels: s.offerte.regels.filter((r) => r.id !== id) },
        })),

      setRegels: (regels) =>
        set((s) => ({ offerte: { ...s.offerte, regels } })),

      setNotities: (notities) =>
        set((s) => ({ offerte: { ...s.offerte, notities } })),

      setBetalingstermijn: (betalingstermijn) =>
        set((s) => ({ offerte: { ...s.offerte, betalingstermijn } })),

      setExtraVoorwaarden: (extraVoorwaarden) =>
        set((s) => ({ offerte: { ...s.offerte, extraVoorwaarden } })),

      setDatum: (datum) =>
        set((s) => ({ offerte: { ...s.offerte, datum } })),

      setGeldigTot: (geldigTot) =>
        set((s) => ({ offerte: { ...s.offerte, geldigTot } })),

      resetKlant: () =>
        set((s) => ({ offerte: { ...s.offerte, klant: { ...defaultKlant }, nummer: generateNummer(), datum: today(), geldigTot: in30days() } })),
    }),
    { name: 'offerte-store-v1', partialize: (s) => ({ offerte: s.offerte }) }
  )
);

export function calcTotalen(regels: OfferteRegel[]) {
  const excl = regels.reduce((sum, r) => sum + r.aantal * r.prijs, 0);
  const btwBedrag = regels.reduce((sum, r) => sum + r.aantal * r.prijs * (r.btw / 100), 0);
  return { excl, btwBedrag, incl: excl + btwBedrag };
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}
