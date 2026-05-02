'use client';

import { useEffect } from 'react';
import { useHouseStore } from '@/store/houseStore';
import { useOfferteStore, calcTotalen, formatEuro, formatDate } from '@/store/offerteStore';

export default function OffertePrintPage() {
  const { originalImage, generatedImage } = useHouseStore();
  const { offerte } = useOfferteStore();
  const { excl, btwBedrag, incl } = calcTotalen(offerte.regels);

  useEffect(() => {
    setTimeout(() => window.print(), 700);
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        body { background: white; margin: 0; padding: 0; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      <div className="max-w-[794px] mx-auto p-10">

        {/* ── HEADER ── */}
        <div className="flex justify-between items-start mb-10 pb-8 border-b-2 border-gray-100">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-3">
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#c8a96e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'black', fontSize: 12, fontWeight: 700 }}>
                  {offerte.bedrijf.naam ? offerte.bedrijf.naam.slice(0, 2).toUpperCase() : 'HC'}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>{offerte.bedrijf.naam || 'Uw Bedrijfsnaam'}</p>
                {offerte.bedrijf.website && <p style={{ fontSize: 11, color: '#999', margin: 0 }}>{offerte.bedrijf.website}</p>}
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
              {offerte.bedrijf.adres && <p>{offerte.bedrijf.adres}</p>}
              {(offerte.bedrijf.postcode || offerte.bedrijf.stad) && <p>{offerte.bedrijf.postcode} {offerte.bedrijf.stad}</p>}
              {offerte.bedrijf.telefoon && <p>{offerte.bedrijf.telefoon}</p>}
              {offerte.bedrijf.email && <p>{offerte.bedrijf.email}</p>}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: 32, fontWeight: 300, color: '#111', margin: '0 0 8px 0', letterSpacing: -1 }}>OFFERTE</h1>
            <div style={{ fontSize: 12, color: '#999', lineHeight: 1.8 }}>
              <p><strong style={{ color: '#111' }}>Nummer:</strong> {offerte.nummer}</p>
              <p><strong style={{ color: '#111' }}>Datum:</strong> {formatDate(offerte.datum)}</p>
              <p><strong style={{ color: '#111' }}>Geldig tot:</strong> {formatDate(offerte.geldigTot)}</p>
            </div>
            {offerte.bedrijf.btwNummer && (
              <p style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>BTW: {offerte.bedrijf.btwNummer}</p>
            )}
          </div>
        </div>

        {/* ── KLANT ── */}
        <div className="mb-8">
          <p style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Offerte voor</p>
          <div style={{ fontSize: 13, lineHeight: 1.7 }}>
            <p style={{ fontWeight: 600, fontSize: 15 }}>{offerte.klant.naam || 'Klantnaam'}</p>
            {offerte.klant.adres && <p style={{ color: '#444' }}>{offerte.klant.adres}</p>}
            {(offerte.klant.postcode || offerte.klant.stad) && (
              <p style={{ color: '#444' }}>{offerte.klant.postcode} {offerte.klant.stad}</p>
            )}
            {offerte.klant.email && <p style={{ color: '#666' }}>{offerte.klant.email}</p>}
          </div>
        </div>

        {/* ── FOTO'S ── */}
        {(originalImage || generatedImage) && (
          <div className="mb-8">
            <p style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Renovatievisualisatie</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {originalImage && (
                <div>
                  <p style={{ fontSize: 10, color: '#aaa', marginBottom: 4 }}>Huidige situatie</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalImage} alt="Voor" style={{ width: '100%', borderRadius: 10, objectFit: 'cover', aspectRatio: '16/9' }} />
                </div>
              )}
              {generatedImage && (
                <div>
                  <p style={{ fontSize: 10, color: '#c8a96e', marginBottom: 4 }}>Na renovatie (AI visualisatie)</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={generatedImage} alt="Na" style={{ width: '100%', borderRadius: 10, objectFit: 'cover', aspectRatio: '16/9', outline: '2px solid #c8a96e44' }} />
                </div>
              )}
            </div>
            <p style={{ fontSize: 9, color: '#ccc', marginTop: 6, textAlign: 'center', fontStyle: 'italic' }}>
              Visualisatie gegenereerd met House Configurator AI — ter indicatie
            </p>
          </div>
        )}

        {/* ── REGELS ── */}
        <div className="mb-8">
          <p style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Werkzaamheden</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f8f6', borderBottom: '2px solid #e8e8e8' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px', color: '#666', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Omschrijving</th>
                <th style={{ textAlign: 'center', padding: '8px 10px', color: '#666', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Aantal</th>
                <th style={{ textAlign: 'center', padding: '8px 10px', color: '#666', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Eenheid</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#666', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Prijs</th>
                <th style={{ textAlign: 'center', padding: '8px 10px', color: '#666', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>BTW</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#666', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Totaal</th>
              </tr>
            </thead>
            <tbody>
              {offerte.regels.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '10px 10px' }}>
                    <p style={{ fontWeight: 500, margin: 0 }}>{r.omschrijving || '—'}</p>
                    {r.detail && <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0 0' }}>{r.detail}</p>}
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px', color: '#444' }}>{r.aantal}</td>
                  <td style={{ textAlign: 'center', padding: '10px', color: '#444' }}>{r.eenheid}</td>
                  <td style={{ textAlign: 'right', padding: '10px', color: '#444' }}>{formatEuro(r.prijs)}</td>
                  <td style={{ textAlign: 'center', padding: '10px', color: '#999' }}>{r.btw}%</td>
                  <td style={{ textAlign: 'right', padding: '10px', fontWeight: 500 }}>{formatEuro(r.aantal * r.prijs)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totalen */}
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: 240 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, color: '#666' }}>
                <span>Subtotaal excl. BTW</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatEuro(excl)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, color: '#666' }}>
                <span>BTW</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatEuro(btwBedrag)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', marginTop: 6, backgroundColor: '#111', borderRadius: 10, fontSize: 15, fontWeight: 700, color: 'white' }}>
                <span>Totaal incl. BTW</span>
                <span style={{ color: '#c8a96e', fontVariantNumeric: 'tabular-nums' }}>{formatEuro(incl)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── NOTITIES ── */}
        {(offerte.notities || offerte.betalingstermijn) && (
          <div className="mb-8 grid grid-cols-2 gap-6">
            {offerte.betalingstermijn && (
              <div style={{ backgroundColor: '#f8f8f6', borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Betalingstermijn</p>
                <p style={{ fontSize: 13, color: '#333' }}>{offerte.betalingstermijn}</p>
              </div>
            )}
            {offerte.notities && (
              <div style={{ backgroundColor: '#f8f8f6', borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Notities</p>
                <p style={{ fontSize: 13, color: '#333', whiteSpace: 'pre-line' }}>{offerte.notities}</p>
              </div>
            )}
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 10, color: '#bbb', maxWidth: 340, lineHeight: 1.5 }}>
            {offerte.extraVoorwaarden}
            {offerte.bedrijf.ibanNummer && <p style={{ marginTop: 6 }}>IBAN: {offerte.bedrijf.ibanNummer}</p>}
            {offerte.bedrijf.kvkNummer && <p>KVK: {offerte.bedrijf.kvkNummer}</p>}
          </div>
          {/* Signature block */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 180, borderBottom: '1px solid #ddd', marginBottom: 6 }} />
            <p style={{ fontSize: 10, color: '#bbb' }}>Handtekening klant voor akkoord</p>
            <p style={{ fontSize: 10, color: '#ccc', marginTop: 2 }}>Datum: _______________</p>
          </div>
        </div>

        {/* Watermark */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ fontSize: 9, color: '#ddd' }}>Offerte gemaakt met House Configurator AI · houseconfiguratorai.vercel.app</p>
        </div>
      </div>
    </div>
  );
}
