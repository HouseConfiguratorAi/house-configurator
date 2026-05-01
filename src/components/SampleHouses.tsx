'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHouseStore } from '@/store/houseStore';

const SAMPLES = [
  {
    id: 'modern-cube',
    label: 'Modern',
    style: 'Kubusarchitectuur',
    url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
  },
  {
    id: 'classic-family',
    label: 'Klassiek',
    style: 'Gezinswoning',
    url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  },
  {
    id: 'contemporary',
    label: 'Eigentijds',
    style: 'Open architectuur',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
  {
    id: 'villa',
    label: 'Villa',
    style: 'Luxe vrijstaand',
    url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
  },
  {
    id: 'farmhouse',
    label: 'Boerderij',
    style: 'Landelijke stijl',
    url: 'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&q=80',
  },
  {
    id: 'townhouse',
    label: 'Stadswoning',
    style: 'Rij- of hoekwoning',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  },
  {
    id: 'bungalow',
    label: 'Bungalow',
    style: 'Gelijkvloers',
    url: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80',
  },
  {
    id: 'dutch',
    label: 'Hollands',
    style: 'Typisch NL',
    url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
  },
  {
    id: 'mediterraan',
    label: 'Mediterraan',
    style: 'Zuid-Europees',
    url: 'https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?w=800&q=80',
  },
];

export default function SampleHouses() {
  const router = useRouter();
  const setOriginalImage = useHouseStore((s) => s.setOriginalImage);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelect = async (sample: (typeof SAMPLES)[0]) => {
    setLoadingId(sample.id);
    try {
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string, `${sample.id}.jpg`);
        router.push('/configure');
      };
      reader.readAsDataURL(blob);
    } catch {
      setLoadingId(null);
      alert('Kon voorbeeld niet laden. Probeer een eigen foto.');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {SAMPLES.map((s) => (
        <button
          key={s.id}
          onClick={() => handleSelect(s)}
          disabled={loadingId !== null}
          className="group relative rounded-xl overflow-hidden aspect-video bg-surface-elevated hover:ring-2 hover:ring-accent/60 transition-all duration-200 disabled:opacity-60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.url}
            alt={s.label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-2 text-left">
            <p className="text-white text-xs font-semibold leading-tight">{s.label}</p>
            <p className="text-gray-400 text-[10px]">{s.style}</p>
          </div>

          {loadingId === s.id && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
